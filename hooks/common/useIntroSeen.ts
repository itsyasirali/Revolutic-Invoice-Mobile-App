import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'intro_seen_v1';

// One shared value, so the intro screen and the root router stay in step.
let seen = false;
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(v: boolean) => void>();

const load = () => {
  if (loaded) return Promise.resolve();
  loading =
    loading ??
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        seen = raw === '1';
      })
      .catch(() => {})
      .finally(() => {
        loaded = true;
        listeners.forEach((fn) => fn(seen));
      });
  return loading;
};

/**
 * Whether the intro has already been shown on this phone. It is saved on the
 * device, so it only appears on the first launch after installing the app.
 */
export const useIntroSeen = () => {
  const [value, setValue] = useState(seen);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    listeners.add(setValue);
    load().then(() => {
      setValue(seen);
      setReady(true);
    });
    return () => {
      listeners.delete(setValue);
    };
  }, []);

  const markSeen = useCallback(async () => {
    seen = true;
    listeners.forEach((fn) => fn(true));
    await AsyncStorage.setItem(KEY, '1').catch(() => {});
  }, []);

  return { introSeen: value, introReady: ready, markSeen };
};
