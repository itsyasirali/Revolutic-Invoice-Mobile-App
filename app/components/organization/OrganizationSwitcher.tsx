import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useOrganizationSwitcher from '@/hooks/organization/useOrganizationSwitcher';
import { OrganizationData } from '@/types/organization';

const OrganizationSwitcher: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    organization,
    organizations,
    isSwitching,
    isOpen,
    setIsOpen,
    handleSelectOrg,
    handleAddNewOrg,
  } = useOrganizationSwitcher();

  const initial = organization?.name?.charAt(0)?.toUpperCase() || 'O';
  const orgName = organization?.name || 'Select Organization';

  return (
    <>
      {/* ── Trigger Button ── */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        disabled={isSwitching}
        className="flex-row items-center gap-2 bg-primary/10 border border-primary/25 rounded-xl px-3 py-1.5 active:bg-primary/20 shadow-xs"
      >
        {/* Avatar */}
        <View className="w-5 h-5 rounded-md bg-primary items-center justify-center">
          <Text className="text-white text-[11px] font-bold">{initial}</Text>
        </View>

        {/* Name */}
        <Text
          className="text-primary text-xs font-bold max-w-[200px]"
          numberOfLines={1}
        >
          {orgName}
        </Text>

        {/* Chevron or Spinner */}
        {isSwitching ? (
          <ActivityIndicator size="small" color="#1AA3FF" />
        ) : (
          <Ionicons name="chevron-down" size={13} color="#1AA3FF" />
        )}
      </TouchableOpacity>

      {/* ── Bottom Sheet Modal ── */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setIsOpen(false)}
        >
          {/* Prevent dismiss on inner press */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl overflow-hidden"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-slate-200" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4 border-b border-slate-100">
              <Text className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Switch Organization
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
              >
                <Ionicons name="close" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Org List */}
            <FlatList
              data={organizations}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={organizations.length > 5}
              style={{ maxHeight: 280 }}
              renderItem={({ item }: { item: OrganizationData }) => {
                const isActive = item.id === organization?.id;
                const itemInitial = item.name?.charAt(0)?.toUpperCase() || 'O';
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectOrg(item.id)}
                    disabled={isSwitching}
                    className={`flex-row items-center justify-between px-5 py-3.5 border-b border-slate-50 active:bg-slate-50 ${isActive ? 'bg-slate-50' : ''}`}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      {/* Avatar */}
                      <View
                        className={`w-8 h-8 rounded-xl items-center justify-center ${isActive ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <Text
                          className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}
                        >
                          {itemInitial}
                        </Text>
                      </View>

                      {/* Name */}
                      <Text
                        className={`text-sm flex-1 ${isActive ? 'font-semibold text-slate-800' : 'font-normal text-slate-600'}`}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {/* Active dot */}
                    {isActive && (
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* Add New Org Button */}
            <View className="border-t border-slate-100 mx-4 mt-1 pt-2">
              <TouchableOpacity
                onPress={handleAddNewOrg}
                className="flex-row items-center gap-3 px-2 py-3 rounded-xl active:bg-primary/5"
              >
                <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                  <Ionicons name="add" size={18} color="#1AA3FF" />
                </View>
                <Text className="text-primary text-sm font-semibold flex-1">
                  Add New Organization
                </Text>
                <Ionicons name="sparkles" size={14} color="#1AA3FF" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default OrganizationSwitcher;
