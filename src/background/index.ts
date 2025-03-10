import { SnoozedTab } from '../types';

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set up initial storage
    chrome.storage.local.set({ snoozedTabs: [] });

    // Create context menu
    chrome.contextMenus.create({
      id: 'snooze-tab',
      title: 'Snooze this tab',
      contexts: ['page'],
    });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'snooze-tab' && tab?.id) {
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
          message: `Your snoozed tab "${snoozedTab.title}" is now open.`,
        });

        // Remove the tab from storage
        const updatedTabs = snoozedTabs.filter(
          (tab: SnoozedTab) => tab.id !== tabId
        );
        await chrome.storage.local.set({ snoozedTabs: updatedTabs });
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

    // Open tabs that should be awakened - using Promise.all instead of for...of
    await Promise.all(
      tabsToWake
        .filter((tab) => tab.url)
        .map((tab) => chrome.tabs.create({ url: tab.url }))
    );

    // Update storage
    if (tabsToWake.length > 0) {
      await chrome.storage.local.set({ snoozedTabs: remainingTabs });
    }

    // Create alarms for remaining snoozed tabs - using Promise.all instead of for...of
    await Promise.all(
      remainingTabs.map((tab) =>
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
