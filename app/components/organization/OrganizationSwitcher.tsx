import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useOrganizationSwitcher from '@/hooks/organization/useOrganizationSwitcher';
import { OrganizationData } from '@/types/organization';
import StandardModal from '../ui/StandardModal';

const OrganizationSwitcher: React.FC = () => {
  const router = useRouter();
  const {
    organization,
    organizations,
    isSwitching,
    isOpen,
    setIsOpen,
    handleSelectOrg,
  } = useOrganizationSwitcher();

  // Opens the full Organizations screen (view details, edit, add).
  const handleManage = () => {
    setIsOpen(false);
    router.push('/screens/organization' as any);
  };

  const orgName = organization?.name || 'Select Organization';

  return (
    <>
      {/* ── Trigger Button ── */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        disabled={isSwitching}
        className="flex-row items-center gap-1.5 py-1.5 max-w-full active:opacity-70"
      >
        {/* Name */}
        <Text
          className="text-slate-900 text-lg font-bold flex-shrink"
          numberOfLines={1}
        >
          {orgName}
        </Text>

        {/* Spinner only while switching */}
        {isSwitching && <ActivityIndicator size="small" color="#64748b" />}
      </TouchableOpacity>

      {/* ── Switcher sheet (StandardModal: same height as the Customer form) ── */}
      <StandardModal visible={isOpen} onClose={() => setIsOpen(false)}>
        <View className="flex-1 bg-slate-100">
          {/* Header: same bar as the create / edit forms (Cancel, title, action) */}
          <View className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white z-10">
            <Pressable onPress={() => setIsOpen(false)}>
              <Text className="text-primary font-semibold text-base">Cancel</Text>
            </Pressable>
            <Text className="font-bold text-lg text-slate-800">Switch Organization</Text>
            <Pressable onPress={handleManage}>
              <Text className="text-primary font-semibold text-base">Manage</Text>
            </Pressable>
          </View>

          {/* Organizations */}
          <FlatList
            data={organizations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            renderItem={({ item }: { item: OrganizationData }) => {
              const isActive = item.id === organization?.id;
              const initial = item.name?.charAt(0)?.toUpperCase() || 'O';
              const meta = [item.industry, item.currency].filter(Boolean).join(' • ');
              return (
                <TouchableOpacity
                  onPress={() => handleSelectOrg(item.id)}
                  disabled={isSwitching}
                  className={`flex-row items-center bg-white rounded-md p-4 mb-3 border shadow-sm ${isActive ? 'border-primary' : 'border-slate-100'}`}
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isActive ? 'bg-primary' : 'bg-primary/10'}`}>
                    <Text className={`text-lg font-extrabold ${isActive ? 'text-white' : 'text-primary'}`}>{initial}</Text>
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {!!meta && (
                      <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                        {meta}
                      </Text>
                    )}
                  </View>
                  {isActive ? (
                    <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                      <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                      <Text className="text-[11px] font-bold text-emerald-700 ml-1">Selected</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              );
            }}
          />

        </View>
      </StandardModal>

    </>
  );
};

export default OrganizationSwitcher;
