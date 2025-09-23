import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SnoozrSettings } from '../../utils/settings';

import { SnoozedTab } from '../../types';
import { getSnoozrSettings } from '../../utils/settings';

vi.mock('../../utils/settings', () => ({
  getSnoozrSettings: vi.fn(),
}));

type AlarmCallback = (alarm: chrome.alarms.Alarm) => Promise<void> | void;
type StartupCallback = () => Promise<void> | void;

// Mock chrome APIs
const mockTabsCreate = vi.fn();
const mockAlarmsCreate = vi.fn();
const mockAlarmsClear = vi.fn();
const mockStorageLocalGet = vi.fn();
const mockStorageLocalSet = vi.fn();
const mockNotificationsCreate = vi.fn();

let alarmListenerCallback: AlarmCallback | undefined;
let startupListenerCallback: StartupCallback | undefined;

global.chrome = {
  alarms: {
    onAlarm: {
      addListener: vi.fn((callback: AlarmCallback) => {
        alarmListenerCallback = callback;
      }),
    },
    create: mockAlarmsCreate,
    clear: mockAlarmsClear,
  },
  runtime: {
    onStartup: {
      addListener: vi.fn((callback: StartupCallback) => {
        // Background registers two onStartup listeners; keep the latest (the one that wakes tabs)
        startupListenerCallback = callback;
      }),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    lastError: undefined,
  },
  storage: {
    local: {
      // Background code awaits these; return Promises
      get: mockStorageLocalGet,
      set: mockStorageLocalSet,
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  tabs: {
    create: mockTabsCreate,
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  notifications: {
    create: mockNotificationsCreate,
  },
  action: {
    openPopup: vi.fn(),
  },
} as unknown as typeof chrome;

async function importAndExecuteBackgroundScript(): Promise<void> {
  // Provide safe defaults for storage before importing modules that use it on load
  mockStorageLocalGet.mockResolvedValue({});
  mockStorageLocalSet.mockResolvedValue(undefined);
  await import('..');
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });
}

describe('Background Script', () => {
  beforeAll(async () => {
    await importAndExecuteBackgroundScript();
  });

  beforeEach(() => {
    vi.mocked(getSnoozrSettings).mockReset();
    mockTabsCreate.mockReset();
    mockAlarmsCreate.mockReset();
    mockAlarmsClear.mockReset();
    mockStorageLocalGet.mockReset();
    mockStorageLocalSet.mockReset();
    mockNotificationsCreate.mockReset();
    chrome.runtime.lastError = undefined;

    mockStorageLocalGet.mockResolvedValue({ snoozedTabs: [] });
    mockStorageLocalSet.mockResolvedValue(undefined);
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
      wakeTime: Date.now() - 1000,
      favicon: 'icon.png',
      createdAt: Date.now(),
      isRecurring: false,
    };

    it('should create tab with active: false if openInBg is true', async () => {
      const settingsOpenBg: SnoozrSettings = {
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: true,
      };
      vi.mocked(getSnoozrSettings).mockResolvedValue(settingsOpenBg);
      mockStorageLocalGet.mockResolvedValue({ snoozedTabs: [mockSnoozedTab] });

      expect(alarmListenerCallback).toBeDefined();
      if (!alarmListenerCallback) throw new Error('alarm listener not defined');

      alarmListenerCallback(mockAlarm);
      await new Promise<void>((r) => {
        setTimeout(() => r(), 0);
      });

      // Non-recurring: fetched once on startup
      expect(getSnoozrSettings).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: mockSnoozedTab.url,
        active: false,
      });
      expect(mockNotificationsCreate).toHaveBeenCalled();
      expect(mockStorageLocalSet).toHaveBeenCalledWith({ snoozedTabs: [] });
    });

    it('should create tab with active: true if openInBg is false', async () => {
      const settingsFg: SnoozrSettings = {
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: false,
      };
      vi.mocked(getSnoozrSettings).mockResolvedValue(settingsFg);
      mockStorageLocalGet.mockResolvedValue({ snoozedTabs: [mockSnoozedTab] });

      expect(alarmListenerCallback).toBeDefined();
      if (!alarmListenerCallback) throw new Error('alarm listener not defined');

      alarmListenerCallback(mockAlarm);
      await new Promise<void>((r) => {
        setTimeout(() => r(), 0);
      });

      // Non-recurring: fetched once
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
        recurrencePattern: { type: 'daily', time: '09:00' },
        id: 456,
      };
      const alarmForRecurring: chrome.alarms.Alarm = {
        name: 'snoozed-tab-456',
        scheduledTime: Date.now(),
      };
      const settingsOpenBg2: SnoozrSettings = {
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: true,
      };
      vi.mocked(getSnoozrSettings).mockResolvedValue(settingsOpenBg2);
      mockStorageLocalGet.mockResolvedValue({ snoozedTabs: [recurringTab] });

      expect(alarmListenerCallback).toBeDefined();
      if (!alarmListenerCallback) throw new Error('alarm listener not defined');

      alarmListenerCallback(alarmForRecurring);
      await new Promise<void>((r) => {
        setTimeout(() => r(), 0);
      });

      expect(mockTabsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ active: false })
      );
      expect(mockAlarmsCreate).toHaveBeenCalledWith(
        expect.stringContaining('snoozed-tab-'),
        expect.objectContaining({ when: expect.any(Number) })
      );
      expect(mockStorageLocalSet).toHaveBeenCalled();
    });
  });

  describe('chrome.runtime.onStartup Listener (tabsToWake)', () => {
    const now = Date.now();
    const tabToWake1: SnoozedTab = {
      id: 789,
      url: 'https://example.com/page1',
      title: 'Page 1',
      wakeTime: now - 2000,
      createdAt: now - 4000,
      isRecurring: false,
    };
    const tabToWake2: SnoozedTab = {
      id: 101,
      url: 'https://example.com/page2',
      title: 'Page 2',
      wakeTime: now - 1000,
      createdAt: now - 3000,
      isRecurring: false,
    };
    const tabNotToWake: SnoozedTab = {
      id: 112,
      url: 'https://example.com/page3',
      title: 'Page 3',
      wakeTime: now + 3600000,
      createdAt: now - 2000,
      isRecurring: false,
    };

    it('should create tabs with active: false if openInBg is true', async () => {
      const settingsOpenBg3: SnoozrSettings = {
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: true,
      };
      vi.mocked(getSnoozrSettings).mockResolvedValue(settingsOpenBg3);
      mockStorageLocalGet.mockResolvedValue({
        snoozedTabs: [tabToWake1, tabToWake2, tabNotToWake],
      });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback)
        throw new Error('startup listener not defined');

      await startupListenerCallback();

      // Settings are fetched once and reused for non-recurring tabs
      expect(getSnoozrSettings).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledTimes(2);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: tabToWake1.url,
        active: false,
      });
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: tabToWake2.url,
        active: false,
      });
      const firstSetArg = mockStorageLocalSet.mock.calls[0][0];
      expect(firstSetArg.snoozedTabs).toEqual([tabNotToWake]);
    });

    it('should create tabs with active: true if openInBg is false', async () => {
      const settingsFg2: SnoozrSettings = {
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: false,
      };
      vi.mocked(getSnoozrSettings).mockResolvedValue(settingsFg2);
      mockStorageLocalGet.mockResolvedValue({ snoozedTabs: [tabToWake1] });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback)
        throw new Error('startup listener not defined');

      await startupListenerCallback();

      // Non-recurring: fetched once on startup only
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
        recurrencePattern: {
          type: 'weekly',
          daysOfWeek: [new Date(tabToWake1.wakeTime).getDay()],
          time: '09:00',
        },
      };
      const settingsOpenBg4: SnoozrSettings = {
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: true,
      };
      vi.mocked(getSnoozrSettings).mockResolvedValue(settingsOpenBg4);
      mockStorageLocalGet.mockResolvedValue({
        snoozedTabs: [recurringTabToWake, tabNotToWake],
      });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback)
        throw new Error('startup listener not defined');

      await startupListenerCallback();

      // Startup fetch + calculateNextWakeTime fetch
      expect(getSnoozrSettings).toHaveBeenCalledTimes(2);
      expect(mockTabsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ url: recurringTabToWake.url, active: false })
      );
      expect(mockAlarmsCreate).toHaveBeenCalledWith(
        expect.stringMatching(/^snoozed-tab-\d+$/),
        expect.objectContaining({ when: expect.any(Number) })
      );
      const snoozedTabsCall = mockStorageLocalSet.mock.calls[0][0].snoozedTabs;
      expect(snoozedTabsCall).toEqual(
        expect.arrayContaining([
          tabNotToWake,
          expect.objectContaining({
            url: recurringTabToWake.url,
            isRecurring: true,
            wakeTime: expect.any(Number),
          }),
        ])
      );
      expect(snoozedTabsCall.length).toBe(2);
    });
  });

  describe('regression: startup + alarm duplicate open (current behavior)', () => {
    it('opens the same overdue tab only once when startup and alarm overlap (expected behavior)', async () => {
      const now = Date.now();
      const overdue: SnoozedTab = {
        id: 9999,
        url: 'https://dup.example.com',
        title: 'Dup',
        wakeTime: now - 10_000,
        createdAt: now - 20_000,
        isRecurring: false,
      };

      // Use stateful storage mocks to reflect updates performed by background code
      const store: { snoozedTabs: SnoozedTab[] } = { snoozedTabs: [overdue] };
      mockStorageLocalGet.mockImplementation(async () => ({ ...store }));
      mockStorageLocalSet.mockImplementation(
        async (val: { snoozedTabs?: SnoozedTab[] }) => {
          if (val && Array.isArray(val.snoozedTabs)) {
            store.snoozedTabs = val.snoozedTabs;
          }
        }
      );

      // open in foreground for determinism
      vi.mocked(getSnoozrSettings).mockResolvedValue({
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: false,
      });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback)
        throw new Error('startup listener not defined');
      expect(alarmListenerCallback).toBeDefined();
      if (!alarmListenerCallback) throw new Error('alarm listener not defined');

      // Simulate race: during the first tabs.create (startup), fire the alarm for the same tab
      const alarm: chrome.alarms.Alarm = {
        name: `snoozed-tab-${overdue.id}`,
        scheduledTime: now,
      } as chrome.alarms.Alarm;
      mockTabsCreate.mockImplementationOnce(async () => {
        await alarmListenerCallback!(alarm);
        return undefined as unknown as chrome.tabs.Tab;
      });

      await startupListenerCallback();

      // Allow the queued alarm task to process
      await new Promise<void>((r) => {
        setTimeout(() => r(), 0);
      });

      // Desired behavior: only one open
      expect(mockTabsCreate).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenNthCalledWith(1, {
        url: overdue.url,
        active: true,
      });
    });
  });

  describe('startup deduplication for duplicate storage entries', () => {
    it('opens a duplicate-overdue entry only once', async () => {
      const now = Date.now();
      const overdue: SnoozedTab = {
        id: 2024,
        url: 'https://dedup.example.com',
        title: 'Dedup',
        wakeTime: now - 1000,
        createdAt: now - 2000,
        isRecurring: false,
      };

      mockStorageLocalGet.mockResolvedValue({
        snoozedTabs: [overdue, { ...overdue }],
      });
      vi.mocked(getSnoozrSettings).mockResolvedValue({
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: true,
      });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback)
        throw new Error('startup listener not defined');

      await startupListenerCallback();

      expect(mockTabsCreate).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: overdue.url,
        active: false,
      });
      // clear called for the id
      expect(mockAlarmsClear).toHaveBeenCalledWith(`snoozed-tab-${overdue.id}`);
    });
  });

  describe('race window: alarm fires before startup storage.set completes', () => {
    it('still opens only once when alarm fires before storage rewrite', async () => {
      const now = Date.now();
      const overdue: SnoozedTab = {
        id: 8080,
        url: 'https://race.example.com',
        title: 'Race',
        wakeTime: now - 10_000,
        createdAt: now - 20_000,
        isRecurring: false,
      };

      // Stateful store with overdue
      const store: { snoozedTabs: SnoozedTab[] } = { snoozedTabs: [overdue] };
      mockStorageLocalGet.mockImplementation(async () => ({ ...store }));

      // When startup attempts to write the new snoozedTabs, trigger the alarm BEFORE we mutate store
      mockStorageLocalSet.mockImplementation(
        async (val: { snoozedTabs?: SnoozedTab[] }) => {
          // Fire the alarm listener first, simulating alarm occurring while startup is still working
          const alarm: chrome.alarms.Alarm = {
            name: `snoozed-tab-${overdue.id}`,
            scheduledTime: now,
          } as chrome.alarms.Alarm;
          if (alarmListenerCallback) {
            await alarmListenerCallback(alarm);
          }
          // Now apply the storage mutation that removes the overdue entry
          if (val && Array.isArray(val.snoozedTabs)) {
            store.snoozedTabs = val.snoozedTabs;
          }
        }
      );

      vi.mocked(getSnoozrSettings).mockResolvedValue({
        startOfDay: '09:00',
        endOfDay: '18:00',
        startOfWeek: 1,
        startOfWeekend: 6,
        openInBg: false,
      });

      expect(startupListenerCallback).toBeDefined();
      if (!startupListenerCallback)
        throw new Error('startup listener not defined');

      await startupListenerCallback();

      // Allow any queued tasks to flush
      await new Promise<void>((r) => {
        setTimeout(() => r(), 0);
      });

      // Only one open despite alarm firing during startup window
      expect(mockTabsCreate).toHaveBeenCalledTimes(1);
      expect(mockTabsCreate).toHaveBeenCalledWith({
        url: overdue.url,
        active: true,
      });
    });
  });
});
