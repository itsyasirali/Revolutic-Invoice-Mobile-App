import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerState {
  /** ISO time the very first Start happened. */
  startedAt: string | null;
  /** Active milliseconds accumulated before the current run. */
  accumulatedMs: number;
  /** Epoch ms when the current run began, null while paused or stopped. */
  runningSince: number | null;
}

const KEY = 'revolutic:time-tracking:timer';
const EMPTY: TimerState = { startedAt: null, accumulatedMs: 0, runningSince: null };

const pad = (n: number) => String(n).padStart(2, '0');

/** Stopwatch that survives app restarts (stored on the device). */
export const useTimer = (storageKey: string = KEY) => {
  const [state, setState] = useState<TimerState>(EMPTY);
  const [now, setNow] = useState(() => Date.now());
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
  }, [storageKey]);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(state)).catch(() => {});
  }, [state, storageKey]);

  useEffect(() => {
    if (state.runningSince === null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.runningSince]);

  const elapsedMs = state.accumulatedMs + (state.runningSince !== null ? Math.max(0, now - state.runningSince) : 0);

  const start = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setState((s) => ({ ...s, startedAt: s.startedAt ?? new Date(t).toISOString(), runningSince: t }));
  }, []);

  const pause = useCallback(() => {
    const t = Date.now();
    setState((s) =>
      s.runningSince === null ? s : { ...s, accumulatedMs: s.accumulatedMs + (t - s.runningSince), runningSince: null }
    );
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const display = `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`;

  return {
    running: state.runningSince !== null,
    active: state.startedAt !== null,
    startedAt: state.startedAt,
    elapsedMs,
    display,
    start,
    pause,
    reset,
  };
};
