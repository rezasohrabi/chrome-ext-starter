import { SnoozrSettings } from './settings';

export type SnoozePresetKind = 'relative' | 'rule';

export type SnoozeRule = 'tonight' | 'tomorrow' | 'weekend' | 'next_week';

export type SnoozeIconName =
  | 'clock'
  | 'moon'
  | 'sunrise'
  | 'volleyball'
  | 'briefcase';

export interface SnoozePreset {
  id: string;
  titleTemplate: string;
  kind: SnoozePresetKind;
  relative?: {
    hours?: number;
    days?: number;
  };
  rule?: SnoozeRule;
  icon?: SnoozeIconName;
}

export const DEFAULT_SNOOZE_PRESETS: SnoozePreset[] = [
  {
    id: 'later_today',
    titleTemplate: 'Later (in {hours}h)',
    kind: 'relative',
    relative: { hours: 1 },
    icon: 'clock',
  },
  {
    id: 'tonight',
    titleTemplate: 'Tonight (at {endOfDay})',
    kind: 'rule',
    rule: 'tonight',
    icon: 'moon',
  },
  {
    id: 'tomorrow',
    titleTemplate: 'Tomorrow ({startOfDay})',
    kind: 'rule',
    rule: 'tomorrow',
    icon: 'sunrise',
  },
  {
    id: 'weekend',
    titleTemplate: 'This Weekend ({startOfWeekendName}, {startOfDay})',
    kind: 'rule',
    rule: 'weekend',
    icon: 'volleyball',
  },
  {
    id: 'next_week',
    titleTemplate: 'Next Week ({startOfWeekName}, {startOfDay})',
    kind: 'rule',
    rule: 'next_week',
    icon: 'briefcase',
  },
];

export function buildPresetTitle(
  preset: SnoozePreset,
  settings: SnoozrSettings
): string {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const replacements: Record<string, string | number> = {
    endOfDay: settings.endOfDay,
    startOfDay: settings.startOfDay,
    startOfWeekendName: dayNames[settings.startOfWeekend],
    startOfWeekName: dayNames[settings.startOfWeek],
    hours: preset.relative?.hours ?? '',
    days: preset.relative?.days ?? '',
  };
  return preset.titleTemplate.replace(/\{(\w+)\}/g, (_, key) => {
    const v = replacements[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

export function calculatePresetWakeTime(
  preset: SnoozePreset,
  settings: SnoozrSettings,
  nowMs: number = Date.now()
): number {
  if (preset.kind === 'relative') {
    const hours = preset.relative?.hours ?? 0;
    const days = preset.relative?.days ?? 0;
    return nowMs + hours * 60 * 60 * 1000 + days * 24 * 60 * 60 * 1000;
  }

  // rule-based
  switch (preset.rule) {
    case 'tonight': {
      const today = new Date(nowMs);
      const [h, m] = settings.endOfDay.split(':').map(Number);
      today.setHours(h, m, 0, 0);
      if (today.getTime() < nowMs) {
        return nowMs + 60 * 60 * 1000;
      }
      return today.getTime();
    }
    case 'tomorrow': {
      const tomorrow = new Date(nowMs);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [h, m] = settings.startOfDay.split(':').map(Number);
      tomorrow.setHours(h, m, 0, 0);
      return tomorrow.getTime();
    }
    case 'weekend': {
      const today = new Date(nowMs);
      const currentDay = today.getDay();
      let daysUntil = settings.startOfWeekend - currentDay;
      if (daysUntil < 0) daysUntil += 7;
      if (daysUntil === 0) daysUntil = 7; // always go to next weekend
      const targetDate = new Date(nowMs);
      targetDate.setDate(today.getDate() + daysUntil);
      const [h, m] = settings.startOfDay.split(':').map(Number);
      targetDate.setHours(h, m, 0, 0);
      return targetDate.getTime();
    }
    case 'next_week': {
      const today = new Date(nowMs);
      const currentDay = today.getDay();
      let daysUntil = settings.startOfWeek - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      const targetDate = new Date(nowMs);
      targetDate.setDate(today.getDate() + daysUntil);
      const [h, m] = settings.startOfDay.split(':').map(Number);
      targetDate.setHours(h, m, 0, 0);
      return targetDate.getTime();
    }
    default:
      return nowMs;
  }
}

function normalizePreset(
  preset: SnoozePreset,
  legacyLaterHours?: number
): SnoozePreset {
  const def = DEFAULT_SNOOZE_PRESETS.find((d) => d.id === preset.id);
  const base: SnoozePreset = {
    id: preset.id ?? def?.id ?? `custom_${Date.now()}`,
    titleTemplate: preset.titleTemplate ?? def?.titleTemplate ?? 'Preset',
    kind: preset.kind ?? def?.kind ?? 'relative',
    icon: preset.icon ?? def?.icon,
  } as SnoozePreset;

  // Migrate legacy placeholder {laterHours} -> {hours}
  if (base.titleTemplate && base.titleTemplate.includes('{laterHours}')) {
    base.titleTemplate = base.titleTemplate.replace(
      /\{laterHours\}/g,
      '{hours}'
    );
  }

  if ((preset.kind ?? def?.kind) === 'relative') {
    const rel = preset.relative ?? def?.relative ?? {};
    const { hours: relHours, days } = rel as { hours?: number; days?: number };
    let hours = relHours;
    // Migration: if a legacy preset used settings.laterHours or had no hours for later_today,
    // materialize hours from legacy settings value (default to 1 if absent)
    const hadLegacyFlag = Object.prototype.hasOwnProperty.call(
      rel,
      'useSettingsLaterHours'
    );
    if ((preset.id === 'later_today' && hours === undefined) || hadLegacyFlag) {
      hours = legacyLaterHours ?? 1;
    }
    return {
      ...base,
      kind: 'relative',
      relative: {
        hours,
        days,
      },
    };
  }

  return {
    ...base,
    kind: 'rule',
    rule: preset.rule ?? def?.rule ?? 'tomorrow',
  };
}

function normalizeSnoozePresets(
  presets: SnoozePreset[],
  legacyLaterHours?: number
): SnoozePreset[] {
  const byId: Record<string, SnoozePreset> = Object.fromEntries(
    (presets || []).map((p) => [p.id, p])
  );

  const merged: SnoozePreset[] = presets.map((p) =>
    normalizePreset(p, legacyLaterHours)
  );

  // Ensure any missing defaults are present (append at end without overriding user)
  DEFAULT_SNOOZE_PRESETS.forEach((def) => {
    if (!byId[def.id]) {
      merged.push(def);
    }
  });

  return merged;
}

export async function getSnoozePresets(): Promise<SnoozePreset[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['snoozePresets', 'settings'], (result) => {
      const stored = (result.snoozePresets ??
        DEFAULT_SNOOZE_PRESETS) as SnoozePreset[];
      const legacyLaterHours = Number(result.settings?.laterHours);
      resolve(
        normalizeSnoozePresets(
          stored,
          Number.isNaN(legacyLaterHours) ? undefined : legacyLaterHours
        )
      );
    });
  });
}

export async function setSnoozePresets(presets: SnoozePreset[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ snoozePresets: presets }, () => resolve());
  });
}

export async function resetSnoozePresets(): Promise<void> {
  return setSnoozePresets(DEFAULT_SNOOZE_PRESETS);
}
