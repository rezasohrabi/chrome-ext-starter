// Shared settings type and utility for Snoozr extension
// This will be imported wherever settings are needed

export type SnoozrSettings = {
  startOfDay: string; // e.g., '09:00'
  endOfDay: string; // e.g., '18:00'
  startOfWeek: number; // 0=Sunday, 1=Monday, ...
  startOfWeekend: number; // 0=Sunday, 6=Saturday, ...
};

export const DEFAULT_SETTINGS: SnoozrSettings = {
  startOfDay: '09:00',
  endOfDay: '18:00',
  startOfWeek: 1, // Monday
  startOfWeekend: 6, // Saturday
};

export async function getSnoozrSettings(): Promise<SnoozrSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (result) => {
      resolve({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  });
}

export async function setSnoozrSettings(
  settings: Partial<SnoozrSettings>
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (result) => {
      const newSettings = {
        ...DEFAULT_SETTINGS,
        ...result.settings,
        ...settings,
      };
      chrome.storage.sync.set({ settings: newSettings }, () => resolve());
    });
  });
}
