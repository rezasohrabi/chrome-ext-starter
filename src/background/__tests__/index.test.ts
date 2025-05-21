// jest.mock correctly hoists and mocks the module
jest.mock('../../utils/settings', () => ({
  getSnoozrSettings: jest.fn(),
}));

import { getSnoozrSettings } from '../../utils/settings';
import { SnoozedTab } from '../../types';
// Import the listeners directly to attach them to our mock chrome environment
// This requires the background script to export its listeners or to be refactored
// to make them testable. For now, we'll assume the script immediately runs
// and attaches listeners when imported, or we'll need to trigger its execution.

// To actually test the listeners, we need to simulate the environment
// they expect. This usually means mocking the `chrome` global.

type AlarmCallback = (alarm: chrome.alarms.Alarm) => Promise<void> | void;
type StartupCallback = () => Promise<void> | void;

// Mock chrome APIs
const mockTabsCreate = jest.fn();
const mockAlarmsCreate = jest.fn();
const mockStorageLocalGet = jest.fn();
const mockStorageLocalSet = jest.fn();
const mockNotificationsCreate = jest.fn();

let alarmListenerCallback: AlarmCallback | undefined = undefined;
let startupListenerCallback: StartupCallback | undefined = undefined;

global.chrome = {
  // @ts-expect-error - partial mock
  alarms: {
    onAlarm: {
      addListener: jest.fn((callback) => {
        alarmListenerCallback = callback;
      }),
    },
    create: mockAlarmsCreate,
  },
  // @ts-expect-error - partial mock
  runtime: {
    onStartup: {
      addListener: jest.fn((callback) => {
        startupListenerCallback = callback;
      }),
    },
    onInstalled: {
      addListener: jest.fn(), // Mocked but not used in these tests
    },
    lastError: undefined, // Will be set in specific tests if needed
  },
  // @ts-expect-error - partial mock
  storage: {
    local: {
      get: mockStorageLocalGet,
      set: mockStorageLocalSet,
    },
    sync: { // Mock sync as well, though not directly used by background index.ts
        get: jest.fn(),
        set: jest.fn(),
    }
  },
  tabs: {
    create: mockTabsCreate,
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
        addListener: jest.fn()
    }
  },
  notifications: {
    create: mockNotificationsCreate,
  },
  action: {
    openPopup: jest.fn(),
  }
};

// Function to simulate triggering the background script's main logic.
// If your background script is structured to run on import (e.g. top-level listeners),
// then simply importing it might be enough.
// If it has an init function, call that.
async function importAndExecuteBackgroundScript() {
    // This will execute the script and attach listeners to our mocked chrome
    require('../../background'); 
    // Wait for any async operations within the background script's top level, if any.
    // This is a bit of a hack; ideally, your script would provide a promise or callback.
    await new Promise(resolve => setTimeout(resolve, 0));
}


describe('Background Script', () => {
  beforeAll(async () => {
    // Ensure the background script is imported and listeners are attached once
    await importAndExecuteBackgroundScript();
  });

  beforeEach(() => {
    // Reset mocks before each test
    (getSnoozrSettings as jest.Mock).mockReset();
    mockTabsCreate.mockReset();
    mockAlarmsCreate.mockReset();
    mockStorageLocalGet.mockReset();
    mockStorageLocalSet.mockReset();
    mockNotificationsCreate.mockReset();
    chrome.runtime.lastError = undefined;

    // Default mock implementations
    mockStorageLocalGet.mockImplementation((keys, callback) => {
      callback({ snoozedTabs: [] }); // Default to no snoozed tabs
    });
    mockStorageLocalSet.mockImplementation((data, callback) => {
      if (callback) callback();
    });
  });

  describe('chrome.alarms.onAlarm Listener', () => {
    const mockAlarm: chrome.alarms.Alarm = {
      name: 'snoozed-tab-123',
      scheduledTime: Date.now(),
    };
    const mockSnoozedTab: SnoozedTab = {
      id: 123,
      url: 'https://example.com',
      title: 'Example Tab',
      wakeTime: Date.now() - 1000, // Already passed
      favicon: 'icon.png',
      isRecurring: false,
    };

    it('should create tab with active: false if openInBg is true', async () => {
      (getSnoozrSettings as jest.Mock).mockResolvedValue({ openInBg: true });
      mockStorageLocalGet.mockImplementation((keys, callback) => {
        callback({ snoozedTabs: [mockSnoozedTab] });
      });

      expect(alarmListenerCallback).toBeDefined();
      if (!alarmListenerCallback) throw new Error("alarm listener not defined");

      await alarmListenerCallback(mockAlarm);

      expect(getSnoozrSettings).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: mockSnoozedTab.url,
        active: false,
      });
      expect(mockNotificationsCreate).toHaveBeenCalled();
      expect(mockStorageLocalSet).toHaveBeenCalledWith(
        { snoozedTabs: [] }, // Tab should be removed after waking
        expect.any(Function)
      );
    });

    it('should create tab with active: true if openInBg is false', async () => {
      (getSnoozrSettings as jest.Mock).mockResolvedValue({ openInBg: false });
      mockStorageLocalGet.mockImplementation((keys, callback) => {
        callback({ snoozedTabs: [mockSnoozedTab] });
      });

      expect(alarmListenerCallback).toBeDefined();
       if (!alarmListenerCallback) throw new Error("alarm listener not defined");

      await alarmListenerCallback(mockAlarm);

      expect(getSnoozrSettings).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: mockSnoozedTab.url,
        active: true,
      });
    });

    it('should handle recurring tabs correctly with openInBg setting', async () => {
        const recurringTab: SnoozedTab = {
            ...mockSnoozedTab,
            isRecurring: true,
            recurrencePattern: { type: 'daily' },
            id: 456, // different id
        };
        const alarmForRecurring: chrome.alarms.Alarm = {
            name: 'snoozed-tab-456',
            scheduledTime: Date.now(),
        };
        (getSnoozrSettings as jest.Mock).mockResolvedValue({ openInBg: true });
        mockStorageLocalGet.mockImplementation((keys, callback) => {
            callback({ snoozedTabs: [recurringTab] });
        });
        
        // Mock calculateNextWakeTime if it's used
        // jest.mock('../../utils/recurrence', () => ({
        //   calculateNextWakeTime: jest.fn().mockResolvedValue(Date.now() + 100000),
        // }));
        // For this test, we'll assume calculateNextWakeTime works and is complex to mock here,
        // focusing on the openInBg part. The background script itself calls it.

        expect(alarmListenerCallback).toBeDefined();
        if (!alarmListenerCallback) throw new Error("alarm listener not defined");

        await alarmListenerCallback(alarmForRecurring);

        expect(mockTabsCreate).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
        expect(mockAlarmsCreate).toHaveBeenCalledWith(
            expect.stringContaining('snoozed-tab-'), // New alarm for next recurrence
            expect.objectContaining({ when: expect.any(Number) })
        );
        expect(mockStorageLocalSet).toHaveBeenCalled(); // Tab gets updated and re-saved
    });
  });

  describe('chrome.runtime.onStartup Listener (tabsToWake)', () => {
    const now = Date.now();
    const tabToWake1: SnoozedTab = {
      id: 789,
      url: 'https://example.com/page1',
      title: 'Page 1',
      wakeTime: now - 2000, // Should have awakened
      isRecurring: false,
    };
    const tabToWake2: SnoozedTab = {
      id: 101,
      url: 'https://example.com/page2',
      title: 'Page 2',
      wakeTime: now - 1000, // Should have awakened
      isRecurring: false,
    };
    const tabNotToWake: SnoozedTab = {
      id: 112,
      url: 'https://example.com/page3',
      title: 'Page 3',
      wakeTime: now + 3600000, // Future tab
      isRecurring: false,
    };

    it('should create tabs with active: false if openInBg is true', async () => {
      (getSnoozrSettings as jest.Mock).mockResolvedValue({ openInBg: true });
      mockStorageLocalGet.mockImplementation((keys, callback) => {
        callback({ snoozedTabs: [tabToWake1, tabToWake2, tabNotToWake] });
      });
      
      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback) throw new Error("startup listener not defined");

      await startupListenerCallback();

      // getSnoozrSettings is called for each tab to wake
      expect(getSnoozrSettings).toHaveBeenCalledTimes(2); 
      expect(mockTabsCreate).toHaveBeenCalledTimes(2);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: tabToWake1.url,
        active: false,
      });
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: tabToWake2.url,
        active: false,
      });
      // Ensure remaining tabs are set correctly
      expect(mockStorageLocalSet.mock.calls[0][0].snoozedTabs).toEqual([tabNotToWake]);
    });

    it('should create tabs with active: true if openInBg is false', async () => {
      (getSnoozrSettings as jest.Mock).mockResolvedValue({ openInBg: false });
      mockStorageLocalGet.mockImplementation((keys, callback) => {
        callback({ snoozedTabs: [tabToWake1] }); // Only one tab for simplicity
      });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback) throw new Error("startup listener not defined");

      await startupListenerCallback();

      expect(getSnoozrSettings).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: tabToWake1.url,
        active: true,
      });
    });

     it('should correctly reschedule recurring tabs on startup, respecting openInBg', async () => {
        const recurringTabToWake: SnoozedTab = {
            ...tabToWake1,
            id: 1314,
            isRecurring: true,
            recurrencePattern: { type: 'weekly', days: [new Date(tabToWake1.wakeTime).getDay()] }
        };
        (getSnoozrSettings as jest.Mock).mockResolvedValue({ openInBg: true }); // Test with openInBg: true
        mockStorageLocalGet.mockImplementation((keys, callback) => {
            callback({ snoozedTabs: [recurringTabToWake, tabNotToWake] });
        });

        // const nextWakeTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // Assume calculateNextWakeTime returns this
        // jest.mock('../../utils/recurrence', () => ({
        //   calculateNextWakeTime: jest.fn().mockResolvedValue(nextWakeTime),
        // }));


        expect(startupListenerCallback).toBeDefined();
        if (!startupListenerCallback) throw new Error("startup listener not defined");
        
        await startupListenerCallback();

        expect(getSnoozrSettings).toHaveBeenCalledTimes(1); // Called for the tab being woken
        expect(mockTabsCreate).toHaveBeenCalledWith(expect.objectContaining({
            url: recurringTabToWake.url,
            active: false, // Respects openInBg
        }));
        expect(mockAlarmsCreate).toHaveBeenCalledWith(
            expect.stringMatching(/^snoozed-tab-\d+$/), // New alarm for next recurrence
            expect.objectContaining({ when: expect.any(Number) })
        );
        // Check that the tabNotToWake and the rescheduled recurringTabToWake are in storage
        const snoozedTabsCall = mockStorageLocalSet.mock.calls[0][0].snoozedTabs;
        expect(snoozedTabsCall).toEqual(
            expect.arrayContaining([
                tabNotToWake, // The tab that wasn't supposed to wake up
                expect.objectContaining({ // The rescheduled recurring tab
                    url: recurringTabToWake.url,
                    isRecurring: true,
                    wakeTime: expect.any(Number) // Should be a future time
                })
            ])
        );
        expect(snoozedTabsCall.length).toBe(2);
    });
  });
});
