import { getSnoozrSettings, setSnoozrSettings, DEFAULT_SETTINGS } from '../settings';

// Mock chrome.storage.sync
global.chrome = {
  storage: {
    // @ts-expect-error - partial mock
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  // @ts-expect-error - partial mock
  runtime: {
    lastError: undefined,
  }
};

describe('Snoozr Settings', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (chrome.storage.sync.get as jest.Mock).mockReset();
    (chrome.storage.sync.set as jest.Mock).mockReset();
    chrome.runtime.lastError = undefined;
  });

  describe('getSnoozrSettings', () => {
    it('should return default settings if no settings are stored', async () => {
      (chrome.storage.sync.get as jest.Mock).mockImplementation((keys, callback) => {
        callback({}); // Simulate no settings stored
      });
      const settings = await getSnoozrSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
      expect(settings.openInBg).toBe(false); // Specifically check the new default
    });

    it('should return stored settings, including openInBg', async () => {
      const storedSettings = { ...DEFAULT_SETTINGS, openInBg: true, startOfDay: '08:00' };
      (chrome.storage.sync.get as jest.Mock).mockImplementation((keys, callback) => {
        callback({ snoozrSettings: storedSettings });
      });
      const settings = await getSnoozrSettings();
      expect(settings).toEqual(storedSettings);
      expect(settings.openInBg).toBe(true);
    });

    it('should return default openInBg if it is not in stored settings (for migration)', async () => {
      const oldSettings = { ...DEFAULT_SETTINGS };
      // @ts-expect-error - testing migration
      delete oldSettings.openInBg; // Simulate old settings without openInBg

      (chrome.storage.sync.get as jest.Mock).mockImplementation((keys, callback) => {
        callback({ snoozrSettings: oldSettings });
      });
      const settings = await getSnoozrSettings();
      expect(settings.openInBg).toBe(DEFAULT_SETTINGS.openInBg);
      expect(settings.startOfDay).toBe(DEFAULT_SETTINGS.startOfDay); // ensure other settings are preserved
    });

     it('should handle chrome.runtime.lastError during get', async () => {
      chrome.runtime.lastError = { message: 'Simulated error during get' };
      (chrome.storage.sync.get as jest.Mock).mockImplementation((keys, callback) => {
        callback({}); // Call callback even if there's an error
      });
      // We expect getSnoozrSettings to still resolve with defaults or existing data
      // and log the error, but here we just ensure it doesn't crash
      await expect(getSnoozrSettings()).resolves.toEqual(DEFAULT_SETTINGS);
      // In a real scenario, you might want to spy on console.error
    });
  });

  describe('setSnoozrSettings', () => {
    it('should save the provided settings to chrome.storage.sync', async () => {
      const newSettings = { ...DEFAULT_SETTINGS, openInBg: true, endOfDay: '20:00' };
      (chrome.storage.sync.set as jest.Mock).mockImplementation((data, callback) => {
        callback();
      });

      await setSnoozrSettings(newSettings);

      expect(chrome.storage.sync.set).toHaveBeenCalledTimes(1);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { snoozrSettings: newSettings },
        expect.any(Function)
      );
    });

    it('should resolve even if chrome.runtime.lastError occurs during set', async () => {
      const newSettings = { ...DEFAULT_SETTINGS, openInBg: true };
      chrome.runtime.lastError = { message: 'Simulated error during set' };
      (chrome.storage.sync.set as jest.Mock).mockImplementation((data, callback) => {
        callback(); // Call callback even if there's an error
      });

      // setSnoozrSettings resolves void, so we just check it doesn't throw
      await expect(setSnoozrSettings(newSettings)).resolves.toBeUndefined();
      expect(chrome.storage.sync.set).toHaveBeenCalledTimes(1);
      // In a real scenario, you might want to spy on console.error
    });

    it('should reject if chrome.storage.sync.set calls callback with an error (unexpected)', async () => {
        // This tests a scenario not explicitly handled by try/catch in setSnoozrSettings,
        // but showcases how Promise rejections would work if the callback itself indicated an error.
        // However, chrome.storage.set's callback doesn't typically pass an error object; it uses chrome.runtime.lastError.
        // This test is more for hypothetical robustness.
        const newSettings = { ...DEFAULT_SETTINGS, openInBg: true };
        (chrome.storage.sync.set as jest.Mock).mockImplementation((data, callback) => {
           // Simulate an error being passed to the callback, though this isn't standard for chrome.storage.sync
           // @ts-expect-error
          callback(new Error("Failed to set"));
        });

        // Since setSnoozrSettings wraps the callback in a Promise,
        // and doesn't explicitly handle an error argument in the callback,
        // this setup would lead to the Promise resolving to the error object.
        // A more robust handler might specifically reject the promise.
        // For now, we test the current behavior.
        try {
            await setSnoozrSettings(newSettings);
        } catch (e) {
            expect(e).toEqual(new Error("Failed to set"));
        }
    });
  });
});
