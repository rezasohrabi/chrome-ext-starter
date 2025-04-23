import { SnoozedTab } from '../types';
import { calculateNextWakeTime } from '../utils/recurrence';

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
chrome.alarms.onAlarm.addListener(async (alarm) => {
  // Check if this is a snoozed tab alarm
  if (alarm.name.startsWith('snoozed-tab-')) {
    try {
      // Get the tab ID from the alarm name
      const tabId = parseInt(alarm.name.replace('snoozed-tab-', ''), 10);

      // Retrieve the snoozed tabs from storage
      const { snoozedTabs = [] } =
        await chrome.storage.local.get('snoozedTabs');

      // Find the snoozed tab that matches this alarm
      const snoozedTab = snoozedTabs.find(
        (tab: SnoozedTab) => tab.id === tabId
      );

      if (snoozedTab && snoozedTab.url) {
        // Create a new tab with the snoozed URL
        await chrome.tabs.create({ url: snoozedTab.url });

        // Show a notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: snoozedTab.favicon || 'icons/icon128.png',
          title: 'Tab Awakened!',
          message: `Your ${snoozedTab.isRecurring ? 'recurring' : 'snoozed'} tab "${snoozedTab.title}" is now open.`,
        });

        // Check if this is a recurring tab
        if (snoozedTab.isRecurring && snoozedTab.recurrencePattern) {
          // Calculate the next wake time for this recurring tab
          const nextWakeTime = await calculateNextWakeTime(
            snoozedTab.recurrencePattern
          );

          if (nextWakeTime) {
            // Update the tab's wake time for the next occurrence
            const updatedTab = {
              ...snoozedTab,
              wakeTime: nextWakeTime,
            };

            // Create a new tab ID since Chrome doesn't allow reusing the same tab ID
            const newTabId = Date.now(); // Using timestamp as a simple unique ID
            updatedTab.id = newTabId;

            // Update the snoozed tabs list
            const updatedTabs = snoozedTabs.filter(
              (tab: SnoozedTab) => tab.id !== tabId
            );
            updatedTabs.push(updatedTab);

            // Save the updated tabs
            await chrome.storage.local.set({ snoozedTabs: updatedTabs });

            // Create a new alarm for the next occurrence
            await chrome.alarms.create(`snoozed-tab-${newTabId}`, {
              when: nextWakeTime,
            });

            // Remove the console.log statement
          } else {
            // End of recurrence, remove the tab from storage
            const updatedTabs = snoozedTabs.filter(
              (tab: SnoozedTab) => tab.id !== tabId
            );
            await chrome.storage.local.set({ snoozedTabs: updatedTabs });
          }
        } else {
          // Not recurring, remove the tab from storage
          const updatedTabs = snoozedTabs.filter(
            (tab: SnoozedTab) => tab.id !== tabId
          );
          await chrome.storage.local.set({ snoozedTabs: updatedTabs });
        }
      }
    } catch (error) {
      // Silently acknowledge error
      if (chrome.runtime.lastError) {
        // Deliberately empty to acknowledge the error
      }
    }
  }
});

// Check for tabs that should have awakened (in case Chrome was closed)
chrome.runtime.onStartup.addListener(async () => {
  try {
    const { snoozedTabs = [] } = await chrome.storage.local.get('snoozedTabs');
    const now = Date.now();

    // Find tabs that should have been awakened
    const tabsToWake = snoozedTabs.filter(
      (tab: SnoozedTab) => tab.wakeTime <= now
    );
    const remainingTabs = snoozedTabs.filter(
      (tab: SnoozedTab) => tab.wakeTime > now
    );

    // Process tabs that should be awakened - using Promise.all instead of for loop
    await Promise.all(
      tabsToWake.map(async (tab: SnoozedTab) => {
        if (tab.url) {
          // Open the tab
          await chrome.tabs.create({ url: tab.url });

          // If it's a recurring tab, schedule the next occurrence
          if (tab.isRecurring && tab.recurrencePattern) {
            const nextWakeTime = await calculateNextWakeTime(
              tab.recurrencePattern
            );

            if (nextWakeTime) {
              // Create a new tab entry with updated wake time
              const newTabId = Date.now();
              const updatedTab = {
                ...tab,
                id: newTabId,
                wakeTime: nextWakeTime,
              };

              // Add the updated tab to the remaining tabs
              remainingTabs.push(updatedTab);

              // Create a new alarm for the next occurrence
              await chrome.alarms.create(`snoozed-tab-${newTabId}`, {
                when: nextWakeTime,
              });
            }
          }
        }
      })
    );

    // Update storage with remaining tabs (which now includes rescheduled recurring tabs)
    await chrome.storage.local.set({ snoozedTabs: remainingTabs });

    // Create alarms for all remaining snoozed tabs
    await Promise.all(
      remainingTabs.map((tab: SnoozedTab) =>
        chrome.alarms.create(`snoozed-tab-${tab.id}`, {
          when: tab.wakeTime,
        })
      )
    );
  } catch (error) {
    // Silently acknowledge error
    if (chrome.runtime.lastError) {
      // Deliberately empty to acknowledge the error
    }
  }
});
