import { useEffect, useState } from 'react';

import {
  DEFAULT_SNOOZE_PRESETS,
  getSnoozePresets,
  setSnoozePresets,
  SnoozePreset,
} from './presets';

const useSnoozePresets = (): [
  SnoozePreset[],
  (
    updater: SnoozePreset[] | ((prev: SnoozePreset[]) => SnoozePreset[])
  ) => void,
  boolean,
] => {
  const [presets, setPresetsState] = useState<SnoozePreset[]>(
    DEFAULT_SNOOZE_PRESETS
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSnoozePresets().then((p) => {
      if (mounted) {
        setPresetsState(p);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setPresets = (
    updater: SnoozePreset[] | ((prev: SnoozePreset[]) => SnoozePreset[])
  ) => {
    setPresetsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSnoozePresets(next);
      return next;
    });
  };

  return [presets, setPresets, loading];
};

export default useSnoozePresets;
