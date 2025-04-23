import { useEffect, useState } from 'react';

import {
  DEFAULT_SETTINGS,
  getSnoozrSettings,
  setSnoozrSettings,
  SnoozrSettings,
} from './settings';

/**
 * React hook for accessing and updating Snoozr user settings.
 * Returns [settings, setPartialSettings, loading].
 * setPartialSettings accepts a partial update and persists it.
 */
const useSettings = (): [
  SnoozrSettings,
  (partial: Partial<SnoozrSettings>) => void,
  boolean,
] => {
  const [settings, setSettings] = useState<SnoozrSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSnoozrSettings().then((s) => {
      if (mounted) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setPartialSettings = (partial: Partial<SnoozrSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      setSnoozrSettings(updated);
      return updated;
    });
  };

  return [settings, setPartialSettings, loading];
};

export default useSettings;
