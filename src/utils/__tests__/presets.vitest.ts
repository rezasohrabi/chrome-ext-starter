import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SnoozePreset } from '../presets';
import type { SnoozrSettings } from '../settings';

import {
  buildPresetTitle,
  calculatePresetWakeTime,
  DEFAULT_SNOOZE_PRESETS,
  getSnoozePresets,
  setSnoozePresets,
} from '../presets';

// Minimal chrome mock for storage.sync
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
} as unknown as typeof chrome;

describe('presets utils', () => {
  beforeEach(() => {
    vi.mocked(chrome.storage.sync.get).mockReset();
    vi.mocked(chrome.storage.sync.set).mockReset();
  });

  const baseSettings: SnoozrSettings = {
    startOfDay: '10:00',
    endOfDay: '20:00',
    startOfWeek: 1,
    startOfWeekend: 6,
    openInBg: false,
  };

  it('buildPresetTitle substitutes placeholders from settings and preset', () => {
    const later = DEFAULT_SNOOZE_PRESETS.find((p) => p.id === 'later_today')!;
    const custom: SnoozePreset = {
      ...later,
      relative: { hours: 3 },
    };
    const title = buildPresetTitle(custom, baseSettings);
    expect(title).toBe('Later (in 3h)');
  });

  it('calculatePresetWakeTime handles relative hours and days', () => {
    const now = new Date('2025-01-01T00:00:00.000Z').getTime();
    const preset: SnoozePreset = {
      id: 'rel_1',
      titleTemplate: 'In {hours}h',
      kind: 'relative',
      relative: { hours: 2, days: 1 },
    };
    const ts = calculatePresetWakeTime(preset, baseSettings, now);
    // 1 day + 2 hours
    expect(ts - now).toBe(24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);
  });

  it('calculatePresetWakeTime for tonight returns endOfDay today if in future, else +1h', () => {
    const today = new Date();
    const h = today.getUTCHours();
    const m = today.getUTCMinutes();
    const now = Date.now();

    // Set endOfDay far in the future for certainty
    const s1: SnoozrSettings = { ...baseSettings, endOfDay: '23:59' };
    const tonight: SnoozePreset = {
      id: 'tonight',
      titleTemplate: 'Tonight',
      kind: 'rule',
      rule: 'tonight',
    };
    const t1 = calculatePresetWakeTime(tonight, s1, now);
    expect(t1).toBeGreaterThanOrEqual(now);

    // If endOfDay has already passed, fallback is now + 1h
    const pastHour = Math.max(0, h - 2)
      .toString()
      .padStart(2, '0');
    const s2: SnoozrSettings = {
      ...baseSettings,
      endOfDay: `${pastHour}:${m.toString().padStart(2, '0')}`,
    };
    const t2 = calculatePresetWakeTime(tonight, s2, now);
    expect(t2).toBeGreaterThanOrEqual(now + 60 * 60 * 1000);
  });

  it('getSnoozePresets returns defaults when storage empty', async () => {
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (keys: unknown, cb: (res: Record<string, unknown>) => void) => {
        cb({});
      }
    );
    const presets = await getSnoozePresets();
    expect(presets.length).toBeGreaterThanOrEqual(
      DEFAULT_SNOOZE_PRESETS.length
    );
  });

  it('getSnoozePresets normalizes legacy later_today and title placeholders', async () => {
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (keys: unknown, cb: (res: Record<string, unknown>) => void) => {
        cb({
          snoozePresets: [
            {
              id: 'later_today',
              titleTemplate: 'Later (in {laterHours}h)',
              kind: 'relative',
              relative: {},
              icon: 'clock',
            },
          ],
          settings: { laterHours: 3 },
        });
      }
    );
    const presets = await getSnoozePresets();
    const p = presets.find((x) => x.id === 'later_today')!;
    expect(p.relative?.hours).toBe(3);
    const title = buildPresetTitle(p, baseSettings);
    expect(title).toBe('Later (in 3h)');
  });

  it('setSnoozePresets persists the provided presets', async () => {
    vi.mocked(chrome.storage.sync.set).mockImplementation(
      (data: Record<string, unknown>, callback: () => void) => {
        callback();
      }
    );
    const sample: SnoozePreset[] = [
      {
        id: 'custom',
        titleTemplate: 'In {hours}h',
        kind: 'relative',
        relative: { hours: 5 },
        icon: 'clock',
      },
    ];
    await setSnoozePresets(sample);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { snoozePresets: sample },
      expect.any(Function)
    );
  });
});
