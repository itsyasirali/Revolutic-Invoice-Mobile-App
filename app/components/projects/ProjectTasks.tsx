import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import InputField from '../ui/InputField';

interface Task {
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
}

/** Add, rename, complete and delete project tasks (same API as the web). */
const ProjectTasks: React.FC<Props> = ({ projectId, tasks, onTasks }) => {
  const [editing, setEditing] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fail = (e: any, fallback: string) => Alert.alert('Error', e?.response?.data?.message || fallback);

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
        if (res.data?.task) onTasks((list) => [...list, res.data.task]);
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
          } catch (e) {
            fail(e, 'Failed to delete task');
          }
        },
      },
    ]);

  return (
    <View className="bg-white rounded-md shadow-sm mb-4 border border-slate-100 p-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold text-slate-800">Tasks</Text>
        <Pressable onPress={openAdd} className="flex-row items-center">
          <Ionicons name="add-circle-outline" size={20} color="#1AA3FF" />
          <Text className="text-primary font-bold ml-1">Add Task</Text>
        </Pressable>
      </View>

      {tasks.length === 0 && <Text className="text-slate-400 py-3">No tasks yet.</Text>}

      {tasks.map((t) => {
        const done = t.status === 'Completed';
        return (
          <View key={t.id} className="flex-row items-center py-2.5 border-b border-slate-50">
            <Pressable onPress={() => toggle(t)} hitSlop={8} className="mr-3">
              <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={done ? '#10b981' : '#94a3b8'} />
            </Pressable>
            <Pressable className="flex-1 pr-2" onPress={() => openEdit(t)}>
              <Text className={`text-base ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.name}</Text>
              {!!t.description && <Text className="text-xs text-slate-400" numberOfLines={1}>{t.description}</Text>}
            </Pressable>
            <Pressable onPress={() => openEdit(t)} hitSlop={8} className="p-1.5">
              <Ionicons name="create-outline" size={20} color="#64748b" />
            </Pressable>
            <Pressable onPress={() => remove(t)} hitSlop={8} className="p-1.5">
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </Pressable>
          </View>
        );
      })}

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
