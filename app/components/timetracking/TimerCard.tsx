import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '@/hooks/records/useTimer';

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * Start / pause / stop timer. Stopping opens the time-entry form pre-filled
 * with the date and start/end time, so the server prices it like any entry.
 */
const TimerCard: React.FC<{ onStop: (preset: { date: string; startTime: string; endTime: string }) => void }> = ({ onStop }) => {
  const timer = useTimer();
  const [busy, setBusy] = useState(false);

  const stop = () => {
    if (timer.elapsedMs < 60_000) {
      return Alert.alert('Too short', 'Track at least one minute, or discard the timer.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: timer.reset },
      ]);
    }
    setBusy(true);
    const end = new Date();
    // Start = end minus the *active* time, so pauses are not counted.
    const start = new Date(end.getTime() - timer.elapsedMs);
    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    onStop({ date, startTime: hhmm(start), endTime: hhmm(end) });
    timer.reset();
    setBusy(false);
  };

  return (
    <View className="mx-4 mt-3 bg-white rounded-md border border-slate-100 shadow-sm p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Timer</Text>
          <Text className="text-3xl font-bold text-slate-900 mt-0.5" style={{ fontVariant: ['tabular-nums'] }}>
            {timer.display}
          </Text>
        </View>
        <View className="flex-row items-center">
          {!timer.running ? (
            <Pressable onPress={timer.start} className="flex-row items-center bg-primary px-4 py-2.5 rounded-md">
              <Ionicons name="play" size={16} color="#fff" />
              <Text className="text-white font-bold ml-1.5">{timer.active ? 'Resume' : 'Start'}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={timer.pause} className="flex-row items-center bg-amber-500 px-4 py-2.5 rounded-md">
              <Ionicons name="pause" size={16} color="#fff" />
              <Text className="text-white font-bold ml-1.5">Pause</Text>
            </Pressable>
          )}
          {timer.active && (
            <Pressable onPress={stop} disabled={busy} className="flex-row items-center bg-red-500 px-4 py-2.5 rounded-md ml-2">
              <Ionicons name="stop" size={16} color="#fff" />
              <Text className="text-white font-bold ml-1.5">Stop</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export default TimerCard;
