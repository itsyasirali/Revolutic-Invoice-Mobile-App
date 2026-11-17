import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '@/hooks/records/useTimer';

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export interface TimerPreset {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * Timer for one task. It only exists inside a task, so every tracked entry
 * already has its project and task. Stopping opens the time-entry form.
 */
const TaskTimer: React.FC<{ storageKey: string; onStop: (preset: TimerPreset) => void }> = ({ storageKey, onStop }) => {
  const timer = useTimer(storageKey);

  const stop = () => {
    if (timer.elapsedMs < 60_000) {
      return Alert.alert('Too short', 'Track at least one minute, or discard the timer.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: timer.reset },
      ]);
    }
    const end = new Date();
    // Start = end minus the active time, so pauses are not counted.
    const start = new Date(end.getTime() - timer.elapsedMs);
    onStop({
      date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
      startTime: hhmm(start),
      endTime: hhmm(end),
    });
    timer.reset();
  };

  if (!timer.active) {
    return (
      <Pressable onPress={timer.start} hitSlop={8} className="flex-row items-center bg-primary/10 rounded-full px-2.5 py-1.5 mr-1" accessibilityLabel="Start timer">
        <Ionicons name="play" size={14} color="#1AA3FF" />
        <Text className="text-primary text-xs font-bold ml-1">Start</Text>
      </Pressable>
    );
  }

  return (
    <View className="flex-row items-center bg-slate-100 rounded-full pl-2.5 pr-1 py-1 mr-1">
      <Text className="text-xs font-bold text-slate-800" style={{ fontVariant: ['tabular-nums'] }}>
        {timer.display}
      </Text>
      <Pressable onPress={timer.running ? timer.pause : timer.start} hitSlop={6} className="ml-1.5 w-6 h-6 rounded-full bg-amber-500 items-center justify-center">
        <Ionicons name={timer.running ? 'pause' : 'play'} size={12} color="#fff" />
      </Pressable>
      <Pressable onPress={stop} hitSlop={6} className="ml-1 w-6 h-6 rounded-full bg-red-500 items-center justify-center">
        <Ionicons name="stop" size={12} color="#fff" />
      </Pressable>
    </View>
  );
};

export default TaskTimer;
