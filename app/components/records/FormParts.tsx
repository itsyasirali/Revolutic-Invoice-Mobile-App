import React from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';

/** Pinned Cancel / Title / Save header + scrolling body, same as ItemForm. */
export const FormShell: React.FC<{
  title: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  error?: string | null;
  children: React.ReactNode;
}> = ({ title, saving, onCancel, onSave, error, children }) => (
  <View className="flex-1 bg-slate-100">
    <View className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white z-10">
      <Pressable onPress={onCancel}>
        <Text className="text-primary font-semibold text-base">Cancel</Text>
      </Pressable>
      <Text className="font-bold text-lg text-slate-800">{title}</Text>
      <Pressable onPress={onSave} disabled={saving}>
        <Text className={`font-semibold text-base ${saving ? 'text-slate-400' : 'text-primary'}`}>
          {saving ? 'Saving...' : 'Save'}
        </Text>
      </Pressable>
    </View>
    <ScrollView
      className="flex-1 bg-slate-100"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="px-4 py-6">
        {!!error && (
          <View className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        )}
        {children}
      </View>
    </ScrollView>
  </View>
);

/** Horizontal single-choice chips (used for status, billing method, payment method). */
export const ChipSelect: React.FC<{
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <View className="mb-5">
    <Text className="text-sm font-semibold mb-2 text-slate-800">{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row">
        {options.map((o) => (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            className={`px-4 py-2.5 rounded-md mr-2 border ${value === o ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
          >
            <Text className={`font-semibold ${value === o ? 'text-white' : 'text-slate-600'}`}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  </View>
);

export const ToggleRow: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <View className="flex-row items-center justify-between mb-5">
    <Text className="text-sm font-semibold text-slate-800">{label}</Text>
    <Switch value={value} onValueChange={onChange} trackColor={{ true: '#1AA3FF' }} />
  </View>
);
