import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface PickerOption {
  value: string;
  label: string;
}

interface SearchablePickerModalProps {
  visible: boolean;
  title: string;
  options: (string | PickerOption)[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  searchPlaceholder?: string;
}

export const SearchablePickerModal: React.FC<SearchablePickerModalProps> = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  searchPlaceholder = 'Search...',
}) => {
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const normalized: PickerOption[] = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const filtered = normalized.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (val: string) => {
    onSelect(val);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="flex-1 bg-black/40"
        style={{ paddingTop: Math.max(insets.top, 16) + 12 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View
          className="bg-white rounded-3xl overflow-hidden mx-4"
          style={{ maxHeight: '80%', paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-[16px] font-bold text-slate-800">{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            >
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-slate-100 rounded-xl px-3 gap-2">
              <Ionicons name="search-outline" size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 text-slate-700 text-sm py-2.5"
                placeholder={searchPlaceholder}
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Options List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.value === selected;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className={`flex-row items-center justify-between px-5 py-3.5 border-b border-slate-50 active:bg-slate-50 ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <Text
                    className={`text-[14px] flex-1 pr-3 ${
                      isSelected
                        ? 'text-primary font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color="#1AA3FF" />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View className="py-10 items-center">
                <Ionicons name="search-outline" size={32} color="#cbd5e1" />
                <Text className="text-slate-400 text-sm mt-2">
                  No results found
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default React.memo(SearchablePickerModal);
