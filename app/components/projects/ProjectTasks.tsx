import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import InputField from '../ui/InputField';
import TaskTimer, { type TimerPreset } from './TaskTimer';

export interface Task {
  id: number;
  name: string;
  description?: string | null;
  status: 'Open' | 'Completed';
}

interface Props {
  projectId: number;
  tasks: Task[];
  /** Applies a change to the task list locally; no refetch of the project. */
  onTasks: (update: (tasks: Task[]) => Task[]) => void;
  /** Called with the new task list after every successful change, so the project status can follow it. */
  onTasksChanged?: (tasks: Task[]) => void;
  /** Hourly projects can time their tasks; the timer lives on each open task. */
  timerEnabled?: boolean;
  onTimerStop?: (task: Task, preset: TimerPreset) => void;
}

const ProjectTasks: React.FC<Props> = ({ projectId, tasks, onTasks, onTasksChanged, timerEnabled, onTimerStop }) => {
  const [editing, setEditing] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fail = (e: any, fallback: string) => Alert.alert('Error', e?.response?.data?.message || fallback);
  const doneCount = tasks.filter((t) => t.status === 'Completed').length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const openAdd = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setName(t.name);
    setDescription(t.description || '');
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return Alert.alert('Task name', 'Enter a task name.');
    setSaving(true);
    try {
      if (editing) {
        const res = await axios.put(`/api/projects/${projectId}/tasks/${editing.id}`, { name, description });
        const saved: Task = res.data?.task ?? { ...editing, name, description };
        onTasks((list) => list.map((t) => (t.id === saved.id ? saved : t)));
      } else {
        const res = await axios.post(`/api/projects/${projectId}/tasks`, { name, description });
        if (res.data?.task) {
          onTasks((list) => [...list, res.data.task]);
          onTasksChanged?.([...tasks, res.data.task]); // a new open task reopens a completed project
        }
      }
      setOpen(false);
    } catch (e) {
      fail(e, 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t: Task) => {
    const next: Task['status'] = t.status === 'Completed' ? 'Open' : 'Completed';
    // Show the change immediately, then confirm with the server (undo on failure).
    onTasks((list) => list.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    try {
      await axios.put(`/api/projects/${projectId}/tasks/${t.id}`, { status: next });
      onTasksChanged?.(tasks.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    } catch (e) {
      onTasks((list) => list.map((x) => (x.id === t.id ? { ...x, status: t.status } : x)));
      fail(e, 'Failed to update task');
    }
  };

  const remove = (t: Task) =>
    Alert.alert('Delete task', `Delete "${t.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`/api/projects/${projectId}/tasks/${t.id}`);
            onTasks((list) => list.filter((x) => x.id !== t.id));
            onTasksChanged?.(tasks.filter((x) => x.id !== t.id));
          } catch (e) {
            fail(e, 'Failed to delete task');
          }
        },
      },
    ]);

  return (
    <View className="bg-white rounded-md shadow-sm mb-4 border border-slate-100 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4">
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold text-slate-800">Tasks</Text>
          {tasks.length > 0 && (
            <View className="ml-2 px-2 py-0.5 rounded-full bg-slate-100">
              <Text className="text-xs font-bold text-slate-600">
                {doneCount}/{tasks.length}
              </Text>
            </View>
          )}
        </View>
        <Pressable onPress={openAdd} className="flex-row items-center bg-primary/10 rounded-full px-3 py-1.5 active:bg-primary/20">
          <Ionicons name="add" size={16} color="#1AA3FF" />
          <Text className="text-primary text-xs font-bold ml-0.5">Add Task</Text>
        </Pressable>
      </View>

      {/* Progress */}
      {tasks.length > 0 && (
        <View className="px-4 pt-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs text-slate-400">Progress</Text>
            <Text className="text-xs font-semibold text-slate-600">{pct}%</Text>
          </View>
          <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
          </View>
        </View>
      )}

      {tasks.length === 0 ? (
        <View className="items-center py-8 px-4">
          <Ionicons name="checkbox-outline" size={32} color="#cbd5e1" />
          <Text className="text-slate-400 mt-2">No tasks yet</Text>
        </View>
      ) : (
        <View className="mt-3">
          {tasks.map((t) => {
            const done = t.status === 'Completed';
            return (
              <View key={t.id} className={`px-4 py-3.5 border-t border-slate-100 ${done ? 'bg-slate-50/70' : ''}`}>
                {/* Title row */}
                <View className="flex-row items-start">
                  <Pressable className="flex-1 pr-2" onPress={() => openEdit(t)}>
                    <Text className={`text-[15px] font-semibold ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.name}</Text>
                    {!!t.description && (
                      <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={2}>
                        {t.description}
                      </Text>
                    )}
                  </Pressable>
                  <View className={`px-2.5 py-1 rounded-full border ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-sky-50 border-sky-200'}`}>
                    <Text className={`text-[11px] font-bold ${done ? 'text-emerald-700' : 'text-sky-700'}`}>{done ? 'Completed' : 'Open'}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row items-center mt-3">
                  {timerEnabled && !done && (
                    <TaskTimer storageKey={`revolutic:time-tracking:timer:project:${projectId}:task:${t.id}`} onStop={(preset) => onTimerStop?.(t, preset)} />
                  )}
                  <Pressable
                    onPress={() => toggle(t)}
                    className={`flex-row items-center rounded-full px-3 py-1.5 border ${done ? 'bg-white border-slate-200' : 'bg-emerald-50 border-emerald-200'}`}
                  >
                    <Ionicons name={done ? 'refresh-outline' : 'checkmark'} size={14} color={done ? '#475569' : '#047857'} />
                    <Text className={`text-xs font-bold ml-1 ${done ? 'text-slate-600' : 'text-emerald-700'}`}>{done ? 'Reopen' : 'Complete'}</Text>
                  </Pressable>
                  <View className="flex-1" />
                  <Pressable onPress={() => openEdit(t)} hitSlop={8} className="p-1.5">
                    <Ionicons name="create-outline" size={19} color="#64748b" />
                  </Pressable>
                  <Pressable onPress={() => remove(t)} hitSlop={8} className="p-1.5">
                    <Ionicons name="trash-outline" size={19} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={() => setOpen(false)}>
            <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-md p-5">
              <Text className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit Task' : 'Add Task'}</Text>
              <InputField label="Task Name *" value={name} onChangeText={setName} placeholder="e.g. Design mockups" autoFocus />
              <InputField
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Optional"
                multiline
                numberOfLines={3}
                inputStyle="text-slate-800 text-base flex-1 h-20"
                textAlignVertical="top"
              />
              <View className="flex-row gap-3 mt-1">
                <Pressable onPress={() => setOpen(false)} className="flex-1 py-3 rounded-md border border-slate-200 items-center">
                  <Text className="text-slate-600 font-semibold">Cancel</Text>
                </Pressable>
                <Pressable onPress={save} disabled={saving} className={`flex-1 py-3 rounded-md items-center ${saving ? 'bg-primary/50' : 'bg-primary'}`}>
                  <Text className="text-white font-bold">{saving ? 'Saving...' : 'Save'}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ProjectTasks;
