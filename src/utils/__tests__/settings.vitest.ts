import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SnoozrSettings } from '../settings';

import {
  DEFAULT_SETTINGS,
  getSnoozrSettings,
  setSnoozrSettings,
} from '../settings';

// @ts-expect-error - partial mock
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    lastError: undefined,
  },
} as unknown as typeof chrome;

describe('Snoozr Settings', () => {
  beforeEach(() => {
    vi.mocked(chrome.storage.sync.get).mockReset();
    vi.mocked(chrome.storage.sync.set).mockReset();
    chrome.runtime.lastError = undefined;
  });

  describe('getSnoozrSettings', () => {
    it('returns defaults when empty', async () => {
      vi.mocked(chrome.storage.sync.get).mockImplementation(
        (
          keys: string | string[],
          callback: (result: Record<string, unknown>) => void
        ) => {
          callback({});
        }
      );
      const settings = await getSnoozrSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
      expect(settings.openInBg).toBe(false);
    });

    it('returns stored settings', async () => {
      const stored: SnoozrSettings = {
        ...DEFAULT_SETTINGS,
        openInBg: true,
        startOfDay: '08:00',
      };
      vi.mocked(chrome.storage.sync.get).mockImplementation(
        (
          keys: string | string[],
          callback: (result: Record<string, unknown>) => void
        ) => {
          callback({ settings: stored });
        }
      );
      const settings = await getSnoozrSettings();
      expect(settings).toEqual(stored);
    });
  });

  describe('setSnoozrSettings', () => {
    it('saves provided settings', async () => {
      const newSettings: SnoozrSettings = {
        ...DEFAULT_SETTINGS,
        openInBg: true,
        endOfDay: '20:00',
      } as SnoozrSettings;
      vi.mocked(chrome.storage.sync.get).mockImplementation(
        (
          keys: string | string[],
          callback: (result: Record<string, unknown>) => void
        ) => {
          callback({ settings: {} });
        }
      );
      vi.mocked(chrome.storage.sync.set).mockImplementation(
        (data: Record<string, unknown>, callback: () => void) => {
          callback();
        }
      );

      await setSnoozrSettings(newSettings);

      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { settings: newSettings },
        expect.any(Function)
      );
    });
  });
});
