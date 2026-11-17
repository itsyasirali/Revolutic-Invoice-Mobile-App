import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DetailPageHeader from '../ui/DetailPageHeader';

export interface DetailAction {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  danger?: boolean;
}

interface RecordDetailsProps {
  title: string;
  loading?: boolean;
  onBack: () => void;
  onEdit?: () => void;
  actions?: DetailAction[];
  stats: { label: string; value: string }[];
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  badge?: { label: string; bg: string; border: string; text: string };
  description?: string | null;
  rows: { label: string; value?: string | null }[];
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  modals?: React.ReactNode;
}

/** Same layout as the Item details: header, stats strip, profile card, More Information. */
const RecordDetails: React.FC<RecordDetailsProps> = (p) => {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState(false);
  const [expand, setExpand] = useState(true);

  if (p.loading) {
    return (
      <View className="flex-1 p-4 bg-slate-100 items-center justify-center">
        <ActivityIndicator size="large" color="#1AA3FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <DetailPageHeader
        title={p.title}
        onBack={p.onBack}
        onEdit={p.onEdit}
        onMenu={p.actions?.length ? () => setMenu(true) : undefined}
      />

      <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
        {p.stats.map((s, i) => (
          <View key={s.label} className={`flex-1 ${i === 0 ? 'pl-4' : 'pr-4 border-l pl-4 border-slate-400'}`}>
            <Text className="text-slate-500 text-sm uppercase mb-1">{s.label}</Text>
            <Text className="text-2xl font-bold text-slate-800" numberOfLines={1}>
              {s.value}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white p-4 rounded-md shadow-sm mb-4 border border-slate-100">
          <View className="flex-row items-center mb-1">
            <Ionicons name={p.icon} size={20} color="#64748b" />
            <Text className="ml-2 text-2xl font-normal text-slate-800 flex-shrink" numberOfLines={1}>
              {p.name}
            </Text>
            {p.badge && (
              <View className={`ml-2 px-3 py-1 rounded-full border ${p.badge.bg} ${p.badge.border}`}>
                <Text className={`text-xs font-bold ${p.badge.text}`}>{p.badge.label}</Text>
              </View>
            )}
          </View>
          {!!p.description && <Text className="ml-7 mt-2 text-base text-slate-500">{p.description}</Text>}
        </View>

        {p.extra}

        <View className="bg-white rounded-md shadow-sm mb-4 border border-slate-100 overflow-hidden">
          <Pressable onPress={() => setExpand((v) => !v)} className="flex-row justify-between items-center p-4 bg-white">
            <View className="flex-row items-center">
              <MaterialIcons name="grid-view" size={20} color="#475569" />
              <Text className="ml-3 text-lg font-semibold text-slate-800">More Information</Text>
            </View>
            <MaterialIcons name={expand ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#64748b" />
          </Pressable>
          {expand && (
            <View className="px-4 pb-4 bg-white">
              {p.rows.map((r, i) => (
                <View key={r.label} className={`flex-row py-2 ${i < p.rows.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <Text className="text-slate-500 text-base flex-1">{r.label}</Text>
                  <Text className="text-slate-800 text-base flex-1 text-right">{r.value || '-'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {p.footer}
      </ScrollView>

      {p.modals}

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} onPress={() => setMenu(false)}>
          <View
            className="absolute right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]"
            style={{ top: insets.top + 8 }}
          >
            {p.actions?.map((a, i) => (
              <Pressable
                key={a.label}
                onPress={() => {
                  setMenu(false);
                  a.onPress();
                }}
                className={`flex-row items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <Text className={`text-base ${a.danger ? 'text-red-600' : 'text-slate-800'}`}>{a.label}</Text>
                {a.icon && <MaterialIcons name={a.icon} size={20} color={a.danger ? '#dc2626' : '#64748b'} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default RecordDetails;
