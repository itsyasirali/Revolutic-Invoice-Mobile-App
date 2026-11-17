import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrganization } from '@/context/OrganizationContext';
import { OrganizationData } from '@/types/organization';
import { getStatusStyle } from '@/utils/invoiceStatus';
import DetailPageHeader from '../ui/DetailPageHeader';
import StandardModal from '../ui/StandardModal';
import OrganizationForm from './OrganizationForm';

const Row: React.FC<{ label: string; value?: string | null; last?: boolean }> = ({ label, value, last }) => (
  <View className={`flex-row py-2 ${last ? '' : 'border-b border-slate-50'}`}>
    <Text className="text-slate-500 text-base flex-1">{label}</Text>
    <Text className="text-slate-800 text-base flex-1 text-right">{value || '-'}</Text>
  </View>
);

const OrganizationDetails: React.FC = () => {
  const router = useRouter();
  const { org } = useLocalSearchParams();
  const { organization, organizations, isSwitching, switchOrganization } = useOrganization();
  const [expandMoreInfo, setExpandMoreInfo] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  let parsed: OrganizationData | null = null;
  try {
    const raw = Array.isArray(org) ? org[0] : org;
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }
  // Prefer the freshest copy from context.
  const data = (parsed && organizations.find((o) => o.id === parsed!.id)) || parsed;

  if (!data) {
    return (
      <View className="flex-1 p-4 bg-slate-100 items-center justify-center">
        <ActivityIndicator size="large" color="#1AA3FF" />
      </View>
    );
  }

  const isCurrent = data.id === organization?.id;
  const badge = getStatusStyle('Active');
  const address = [data.streetAddress, data.city, data.stateProvince, data.zipCode, data.businessLocation]
    .filter(Boolean)
    .join(', ');

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/organization' as any));

  const handleOpenOrg = async () => {
    if (!isCurrent) {
      const ok = await switchOrganization(data.id);
      if (!ok) return;
    }
    router.replace('/screens/home');
  };

  return (
    <View className="flex-1 bg-white">
      <DetailPageHeader title={data.name} onBack={handleBack} onEdit={() => setShowEditForm(true)} />

      {/* Header stats section */}
      <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
        <View className="flex-1 pl-4">
          <Text className="text-slate-500 text-sm uppercase mb-1">Industry</Text>
          <Text className="text-2xl font-bold text-slate-800" numberOfLines={1}>
            {data.industry || '-'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 16 }}>
        {/* Profile Card */}
        <View className="bg-white p-4 rounded-md shadow-sm mb-4 border border-slate-100">
          <View className="flex-row items-center mb-1">
            <Ionicons name="business-outline" size={20} color="#64748b" />
            <Text className="ml-2 text-2xl font-normal text-slate-800 flex-shrink" numberOfLines={1}>
              {data.name}
            </Text>
            {isCurrent && (
              <View className={`ml-2 px-3 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
                <Text className={`text-xs font-bold ${badge.text}`}>Selected</Text>
              </View>
            )}
          </View>
          {!!address && <Text className="ml-7 mt-2 text-base text-slate-500">{address}</Text>}
        </View>

        {/* Accordion: More Information */}
        <View className="bg-white rounded-md shadow-sm mb-4 border border-slate-100 overflow-hidden">
          <Pressable
            onPress={() => setExpandMoreInfo((v) => !v)}
            className="flex-row justify-between items-center p-4 bg-white"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="grid-view" size={20} color="#475569" />
              <Text className="ml-3 text-lg font-semibold text-slate-800">More Information</Text>
            </View>
            <MaterialIcons
              name={expandMoreInfo ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#64748b"
            />
          </Pressable>
          {expandMoreInfo && (
            <View className="px-4 pb-4 bg-white">
              <Row label="Industry" value={data.industry} />
              <Row label="Business Location" value={data.businessLocation} />
              <Row label="State / Province" value={data.stateProvince} />
              <Row label="City" value={data.city} />
              <Row label="Street Address" value={data.streetAddress} />
              <Row label="Zip Code" value={data.zipCode} />
              <Row label="Currency" value={data.currency} />
              <Row label="Language" value={data.language} />
              <Row label="Time Zone" value={data.timeZone} />
              <Row label="Email" value={data.email} />
              <Row label="Phone" value={data.phone} />
              <Row label="Website" value={data.website} last />
            </View>
          )}
        </View>

        {!isCurrent && (
        <Pressable
          onPress={handleOpenOrg}
          disabled={isSwitching}
          className={`py-3.5 rounded-md items-center ${isSwitching ? 'bg-primary/50' : 'bg-primary'}`}
        >
          {isSwitching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Open Organization
            </Text>
          )}
        </Pressable>
        )}
      </ScrollView>

      <StandardModal visible={showEditForm} onClose={() => setShowEditForm(false)}>
        <OrganizationForm
          organization={data}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      </StandardModal>
    </View>
  );
};

export default OrganizationDetails;
