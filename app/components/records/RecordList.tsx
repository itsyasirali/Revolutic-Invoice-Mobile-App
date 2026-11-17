import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import InputField from '../ui/InputField';
import ListPageHeader from '../ui/ListPageHeader';
import type { ListMenuProps } from '@/hooks/records/useListMenu';

interface RecordListProps<T> {
  title: string;
  emptyIcon: keyof typeof MaterialIcons.glyphMap;
  emptyText: string;
  searchPlaceholder: string;
  data: T[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  search: string;
  onSearch: (v: string) => void;
  filters?: { key: string; label: string }[];
  filter?: string;
  onFilter?: (k: string) => void;
  onAdd: () => void;
  menu?: ListMenuProps;
  renderItem: (item: T) => React.ReactElement;
  keyOf: (item: T) => string;
  /** Optional block shown between the filters and the list (e.g. the timer). */
  header?: React.ReactNode;
  children?: React.ReactNode;
}

/** Same layout as the Customers list: header, search, filter tabs, card list. */
export function RecordList<T>(p: RecordListProps<T>) {
  return (
    <View className="flex-1 bg-slate-100">
      <ListPageHeader title={p.title} onAddPress={p.onAdd} menu={p.menu} />

      <View className="px-4 py-3 bg-slate-100">
        <InputField
          label=""
          placeholder={p.searchPlaceholder}
          value={p.search}
          onChangeText={p.onSearch}
          containerStyle="mb-0"
          inputStyle="bg-slate-50"
          leftIcon={<Ionicons name="search" size={20} color="#94a3b8" />}
        />
      </View>

      {p.filters && (
        <View className="bg-slate-100 border-b border-gray-100 w-full">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            {p.filters.map((tab) => {
              const active = p.filter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => p.onFilter?.(tab.key)}
                  className={`px-5 py-2.5 mr-2 rounded-md border ${active ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {p.header}

      <View className="flex-1 bg-slate-100">
        {p.loading && p.data.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1AA3FF" />
          </View>
        ) : (
          <FlatList
            data={p.data}
            keyExtractor={p.keyOf}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={p.refreshing} onRefresh={p.onRefresh} tintColor="#1AA3FF" colors={['#1AA3FF']} />
            }
            ListEmptyComponent={
              <View className="py-8 items-center">
                <MaterialIcons name={p.emptyIcon} size={48} color="#94a3b8" />
                <Text className="text-center text-lg mt-2 text-slate-500">{p.emptyText}</Text>
              </View>
            }
            renderItem={({ item }) => p.renderItem(item)}
          />
        )}
      </View>
      {p.children}
    </View>
  );
}

/** Card shell shared by the Projects, Expenses and Quotes lists. */
export const RecordCard: React.FC<{
  onPress: () => void;
  initial: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; bg: string; border: string; text: string };
  stats: { label: string; value: string }[];
}> = ({ onPress, initial, title, subtitle, badge, stats }) => (
  <Pressable onPress={onPress} className="bg-white rounded-md mb-4 p-5 shadow-sm elevation-2">
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center flex-1 pr-2">
        <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
          <Text className="text-2xl font-extrabold text-primary">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-800" numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {badge && (
        <View className={`px-3 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
          <Text className={`text-xs font-bold ${badge.text}`}>{badge.label}</Text>
        </View>
      )}
    </View>
    <View className="mt-4 pt-4 flex-row justify-between border-t border-slate-100">
      {stats.map((s) => (
        <View key={s.label} className="flex-1 pr-2">
          <Text className="text-sm font-bold text-slate-400">{s.label}</Text>
          <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
            {s.value}
          </Text>
        </View>
      ))}
    </View>
  </Pressable>
);
