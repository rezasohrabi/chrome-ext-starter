import { SnoozedTab } from '../types';
import { logger, setDebugLoggingPreference } from '../utils/logger';
import { calculateNextWakeTime } from '../utils/recurrence';
import { getSnoozrSettings } from '../utils/settings';

// For easier debugging from the service worker console:
// eslint-disable-next-line no-restricted-globals
if (typeof self !== 'undefined') {
  // eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-explicit-any
  (self as any).setSnoozrDebugLogging = setDebugLoggingPreference;
}

// Task Queue for serializing storage operations
const taskQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || taskQueue.length === 0) {
    return;
  }
  isProcessingQueue = true;

  try {
    const task = taskQueue.shift();
    if (task) {
      try {
        await task();
      } catch (error) {
        logger.error('Error processing task in queue', { error });
        if (chrome.runtime.lastError) {
          // Acknowledge Chrome API errors
        }
      }
    }
  } finally {
    isProcessingQueue = false;

    // Check if there are more tasks to process
    if (taskQueue.length > 0) {
      // Use setTimeout to prevent deep recursion but maintain asynchronous behavior
      setTimeout(() => processQueue(), 0);
    }
  }
}

function addTaskToQueue(task: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve) => {
    const wrappedTask = async () => {
      try {
        await task();
      } finally {
        resolve();
      }
    };
    taskQueue.push(wrappedTask);
    processQueue();
  });
}

// Function to create or update the context menu
function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'snoozr',
    title: 'Snooze this tab',
    contexts: ['page'],
  });
}

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set up initial storage only on first install
    chrome.storage.local.set({ snoozedTabs: [] });
  }
  setupContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  setupContextMenu();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'snoozr' && tab?.id) {
    // Open the popup programmatically
    chrome.action.openPopup();
  }
});

// Handle alarms when they go off
chrome.alarms.onAlarm.addListener((alarm) => {
  // No longer async here, the task will be async
  if (!alarm.name.startsWith('snoozed-tab-')) {
    return;
  }

  const alarmTabId = parseInt(alarm.name.replace('snoozed-tab-', ''), 10);

  addTaskToQueue(async () => {
    // This is the async task, executed serially
    logger.debug('Processing alarm', { alarmName: alarm.name });
    let result;
    try {
      result = await chrome.storage.local.get('snoozedTabs');
    } catch (storageGetError) {
      logger.error('Failed to get snoozedTabs from storage', {
        storageGetError,
      });
      if (chrome.runtime.lastError) {
        /* Acknowledged */
      }
      return; // Cannot proceed without tab data
    }

    const currentSnoozedTabs = (result.snoozedTabs || []) as SnoozedTab[];
    const tabToWake = currentSnoozedTabs.find((t) => t.id === alarmTabId);

    if (!tabToWake || !tabToWake.url) {
      // Tab not found or no URL, might have been removed or error.
      // The alarm fired, so it's consumed. Nothing more to do for this task.
      logger.warn('Tab to wake not found or has no URL', {
        alarmTabId,
        tabExists: !!tabToWake,
      });
      if (chrome.runtime.lastError && result === undefined) {
        // Error during storage.get - already handled above
      }
      return;
    }

    logger.debug('Tab to wake found', {
      tabId: tabToWake.id,
      url: tabToWake.url,
    });

    // Perform actions for the woken tab
    const settings = await getSnoozrSettings();
    try {
      await chrome.tabs.create({
        url: tabToWake.url,
        active: !settings.openInBg,
      });
      logger.debug('Tab created successfully', { tabId: tabToWake.id });
    } catch (e) {
      logger.error('Failed to create tab', {
        tabId: tabToWake.id,
        url: tabToWake.url,
        error: e,
      });
      if (chrome.runtime.lastError) {
        /* tab creation failed - acknowledged */
      }
    }

    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: tabToWake.favicon || 'icons/icon128.png',
        title: 'Tab Awakened!',
        message: `Your ${
          tabToWake.isRecurring ? 'recurring' : 'snoozed'
        } tab "${tabToWake.title}" is now open.`,
      });
      logger.debug('Notification created for woken tab', {
        tabId: tabToWake.id,
      });
    } catch (notifError) {
      logger.warn('Failed to create notification', {
        tabId: tabToWake.id,
        error: notifError,
      });
      // Non-critical, so don't necessarily stop processing
    }

    let newSnoozedTabsList: SnoozedTab[];

    if (tabToWake.isRecurring && tabToWake.recurrencePattern) {
      const nextWakeTime = await calculateNextWakeTime(
        tabToWake.recurrencePattern
      );
      if (nextWakeTime) {
        const newRecurringTabId =
          Date.now() + Math.floor(Math.random() * 10000);
        newSnoozedTabsList = currentSnoozedTabs.map((t) =>
          t.id === alarmTabId
            ? ({
                ...tabToWake,
                id: newRecurringTabId,
                wakeTime: nextWakeTime,
              } as SnoozedTab)
            : t
        );
        try {
          await chrome.alarms.create(`snoozed-tab-${newRecurringTabId}`, {
            when: nextWakeTime,
          });
          logger.debug('Recurring alarm created for tab', {
            newTabId: newRecurringTabId,
            nextWakeTime,
          });
        } catch (e) {
          logger.error('Failed to create recurring alarm', {
            newTabId: newRecurringTabId,
            error: e,
          });
          if (chrome.runtime.lastError) {
            /* alarm creation failed - acknowledged */
          }
        }
      } else {
        // End of recurrence
        logger.debug('End of recurrence for tab', { tabId: alarmTabId });
        newSnoozedTabsList = currentSnoozedTabs.filter(
          (t) => t.id !== alarmTabId
        );
      }
    } else {
      // Not recurring
      newSnoozedTabsList = currentSnoozedTabs.filter(
        (t) => t.id !== alarmTabId
      );
    }

    try {
      await chrome.storage.local.set({ snoozedTabs: newSnoozedTabsList });
      logger.debug('Snoozed tabs list updated in storage', {
        count: newSnoozedTabsList.length,
      });
    } catch (e) {
      logger.error('Failed to set snoozedTabs in storage', { error: e });
      if (chrome.runtime.lastError) {
        /* storage.set failed - acknowledged */
      }
    }
  });
});

// Check for tabs that should have awakened (in case Chrome was closed)
chrome.runtime.onStartup.addListener(async () => {
  logger.debug('onStartup: Checking for overdue snoozed tabs');
  try {
    await addTaskToQueue(async () => {
      const { snoozedTabs: currentSnoozedTabs = [] } =
        (await chrome.storage.local.get('snoozedTabs')) as {
          snoozedTabs?: SnoozedTab[];
        };
      const settings = await getSnoozrSettings(); // Get settings once
      const now = Date.now();

      // Classify tabs by due-ness
      const dueTabs = currentSnoozedTabs.filter((t) => t.wakeTime <= now);
      const keptTabs = currentSnoozedTabs.filter((t) => t.wakeTime > now);

      // Compute reschedules for recurring tabs concurrently
      const rescheduledResults = await Promise.all(
        dueTabs.map(async (tab) => {
          if (tab.isRecurring && tab.recurrencePattern) {
            const nextWakeTime = await calculateNextWakeTime(
              tab.recurrencePattern
            );
            if (nextWakeTime) {
              const newTabId = Date.now() + Math.floor(Math.random() * 10000);
              logger.debug('onStartup: Rescheduling recurring tab', {
                oldTabId: tab.id,
                newTabId,
                nextWakeTime,
              });
              return {
                ...(tab as SnoozedTab),
                id: newTabId,
                wakeTime: nextWakeTime,
              } as SnoozedTab;
            }
            logger.debug('onStartup: End of recurrence for overdue tab', {
              tabId: tab.id,
            });
          }
          return null;
        })
      );
      const rescheduledTabs = rescheduledResults.filter(
        (t): t is SnoozedTab => t !== null
      );

      const newSnoozedTabsList = [...keptTabs, ...rescheduledTabs];

      // Update storage BEFORE opening tabs to avoid alarm handler finding stale entries
      await chrome.storage.local.set({ snoozedTabs: newSnoozedTabsList });
      logger.debug('onStartup: Snoozed tabs list updated', {
        count: newSnoozedTabsList.length,
      });

      // Deduplicate due tabs by id to avoid double-open from duplicate entries
      const uniqueDueTabs = Array.from(
        dueTabs
          .reduce((acc, tab) => {
            if (!acc.has(tab.id)) acc.set(tab.id, tab);
            return acc;
          }, new Map<number, SnoozedTab>())
          .values()
      );

      // Clear alarms for all due tabs (old ids)
      await Promise.all(
        uniqueDueTabs.map(async (tab) => {
          try {
            await chrome.alarms.clear(`snoozed-tab-${tab.id}`);
          } catch (e) {
            if (chrome.runtime.lastError) {
              // Acknowledge
            }
          }
        })
      );

      // Open all due/overdue tabs now
      await Promise.all(
        uniqueDueTabs.map(async (tab) => {
          if (tab.url) {
            try {
              await chrome.tabs.create({
                url: tab.url,
                active: !settings.openInBg,
              });
              logger.debug('onStartup: Opened overdue tab', {
                tabId: tab.id,
                url: tab.url,
              });
            } catch (e) {
              logger.error('onStartup: Failed to open overdue tab', {
                tabId: tab.id,
                url: tab.url,
                error: e,
              });
              if (chrome.runtime.lastError) {
                /* acknowledged */
              }
            }
          }
        })
      );

      // Create alarms for all tabs that are still snoozed or have been rescheduled
      const alarmsToCreatePromises = newSnoozedTabsList.map(async (tab) => {
        try {
          await chrome.alarms.create(`snoozed-tab-${tab.id}`, {
            when: tab.wakeTime,
          });
          logger.debug('onStartup: Alarm created/recreated for tab', {
            tabId: tab.id,
            wakeTime: tab.wakeTime,
          });
        } catch (e) {
          logger.error('onStartup: Failed to create alarm for tab', {
            tabId: tab.id,
            error: e,
          });
          if (chrome.runtime.lastError) {
            /* acknowledged */
          }
        }
      });
      await Promise.all(alarmsToCreatePromises);
      logger.debug('onStartup: Finished processing alarms for remaining tabs');
    });
  } catch (error) {
    logger.error('Error during onStartup processing', { error });
    if (chrome.runtime.lastError) {
      // Deliberately empty to acknowledge the error, e.g., if an alarm couldn't be created.
    }
  }
});
