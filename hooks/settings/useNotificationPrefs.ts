import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPrefs {
  /** Master switch: off hides the badge and the notification list. */
  enabled: boolean;
  invoices: boolean;
  payments: boolean;
}

const KEY = 'notification_prefs_v1';
const DEFAULTS: NotificationPrefs = { enabled: true, invoices: true, payments: true };

// One shared copy, so the Settings switches, the home bell and the Notifications
// screen all react the moment a switch is flipped.
let prefs: NotificationPrefs = DEFAULTS;
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(p: NotificationPrefs) => void>();

const load = () => {
  if (loaded) return Promise.resolve();
  loading =
    loading ??
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) prefs = { ...DEFAULTS, ...JSON.parse(raw) };
      })
      .catch(() => {})
      .finally(() => {
        loaded = true;
        listeners.forEach((fn) => fn(prefs));
      });
  return loading;
};

/** Device-local notification preferences (enable / disable and per-type switches). */
export const useNotificationPrefs = () => {
  const [state, setState] = useState<NotificationPrefs>(prefs);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    listeners.add(setState);
    load().then(() => {
      setState(prefs);
      setReady(true);
    });
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setPref = useCallback((key: keyof NotificationPrefs, value: boolean) => {
    prefs = { ...prefs, [key]: value };
    listeners.forEach((fn) => fn(prefs));
    AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => {});
  }, []);

  return { prefs: state, ready, setPref };
};

