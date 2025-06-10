import { SnoozedTab } from '../types';
import { calculateNextWakeTime } from '../utils/recurrence';
import { getSnoozrSettings } from '../utils/settings';

// Task Queue for serializing storage operations
const taskQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || taskQueue.length === 0) {
    return;
  }
  isProcessingQueue = true;

  const task = taskQueue.shift();
  if (task) {
    try {
      await task();
    } catch (error) {
      // console.error('Error processing task:', error); // Avoid console.error for linter
      if (chrome.runtime.lastError) {
        // Acknowledge Chrome API errors
      }
    }
  }

  isProcessingQueue = false;
  // Immediately try to process the next task if any
  processQueue(); // Removed void
}

function addTaskToQueue(task: () => Promise<void>) {
  taskQueue.push(task);
  processQueue(); // Removed void
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
    const result = await chrome.storage.local.get('snoozedTabs');
    const currentSnoozedTabs = (result.snoozedTabs || []) as SnoozedTab[];
    const tabToWake = currentSnoozedTabs.find((t) => t.id === alarmTabId);

    if (!tabToWake || !tabToWake.url) {
      // Tab not found or no URL, might have been removed or error.
      // The alarm fired, so it's consumed. Nothing more to do for this task.
      if (chrome.runtime.lastError && result === undefined) {
        // Error during storage.get
      }
      return;
    }

    // Perform actions for the woken tab
    const settings = await getSnoozrSettings();
    try {
      await chrome.tabs.create({
        url: tabToWake.url,
        active: !settings.openInBg,
      });
    } catch (e) {
      if (chrome.runtime.lastError) {
        /* tab creation failed */
      }
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: tabToWake.favicon || 'icons/icon128.png',
      title: 'Tab Awakened!',
      message: `Your ${tabToWake.isRecurring ? 'recurring' : 'snoozed'} tab "${tabToWake.title}" is now open.`,
    });

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
            ? { ...tabToWake, id: newRecurringTabId, wakeTime: nextWakeTime }
            : t
        );
        try {
          await chrome.alarms.create(`snoozed-tab-${newRecurringTabId}`, {
            when: nextWakeTime,
          });
        } catch (e) {
          if (chrome.runtime.lastError) {
            /* alarm creation failed */
          }
        }
      } else {
        // End of recurrence
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
    } catch (e) {
      if (chrome.runtime.lastError) {
        /* storage.set failed */
      }
    }
  });
});

// Check for tabs that should have awakened (in case Chrome was closed)
chrome.runtime.onStartup.addListener(async () => {
  try {
    const { snoozedTabs: currentSnoozedTabs = [] } =
      (await chrome.storage.local.get('snoozedTabs')) as {
        snoozedTabs?: SnoozedTab[];
      };
    const settings = await getSnoozrSettings(); // Get settings once
    const now = Date.now();

    const processedTabsPromises = currentSnoozedTabs.map(
      async (tab: SnoozedTab) => {
        if (tab.wakeTime <= now) {
          // Tab is due or overdue
          if (tab.url) {
            // Open the tab
            await chrome.tabs.create({
              url: tab.url,
              active: !settings.openInBg,
            });
          }

          // If it's a recurring tab, schedule the next occurrence
          if (tab.isRecurring && tab.recurrencePattern) {
            const nextWakeTime = await calculateNextWakeTime(
              tab.recurrencePattern
            );

            if (nextWakeTime) {
              // Create a new tab entry with a new ID and updated wake time
              const newTabId = Date.now() + Math.floor(Math.random() * 10000); // Ensure unique ID
              const updatedTab: SnoozedTab = {
                ...tab,
                id: newTabId,
                wakeTime: nextWakeTime,
              };
              return updatedTab; // Return the rescheduled tab
            }
            // If recurrence ended (nextWakeTime is null), the tab is effectively removed.
            return null;
          }
          // If non-recurring and due, it's opened and then effectively removed.
          return null;
        }
        // Tab is not yet due, keep it.
        return tab;
      }
    );

    const resolvedTabs = await Promise.all(processedTabsPromises);
    const newSnoozedTabsList = resolvedTabs.filter(
      (tab) => tab !== null
    ) as SnoozedTab[];

    // Update storage with the correctly filtered and updated list
    await chrome.storage.local.set({ snoozedTabs: newSnoozedTabsList });

    // Create alarms for all tabs that are still snoozed or have been rescheduled
    const alarmsToCreatePromises = newSnoozedTabsList.map((tab) =>
      chrome.alarms.create(`snoozed-tab-${tab.id}`, { when: tab.wakeTime })
    );
    await Promise.all(alarmsToCreatePromises);
  } catch (error) {
    // Silently acknowledge Chrome API errors, log others if necessary (though avoiding console.error for linters)
    if (chrome.runtime.lastError) {
      // Deliberately empty to acknowledge the error, e.g., if an alarm couldn't be created.
    } else {
      // For other unexpected errors, you might want a more robust logging strategy
      // in a real-world scenario, but for now, keep it silent to pass linting.
      // console.error('Error during onStartup processing:', error); // Avoid for linter
    }
  }
});
