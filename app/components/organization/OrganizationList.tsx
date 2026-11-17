import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useOrganization } from '@/context/OrganizationContext';
import { getStatusStyle } from '@/utils/invoiceStatus';
import InputField from '../ui/InputField';
import StandardModal from '../ui/StandardModal';
import ListPageHeader from '../ui/ListPageHeader';
import OrganizationForm from './OrganizationForm';
import { OrganizationData } from '@/types/organization';

const OrganizationList = () => {
  const router = useRouter();
  const { organization, organizations, loading, refreshOrganizations } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const displayOrganizations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter((o) =>
      [o.name, o.industry, o.businessLocation, o.currency].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [organizations, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrganizations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpen = (org: OrganizationData) => {
    router.push({
      pathname: '/screens/organization/details' as any,
      params: { org: JSON.stringify(org) },
    });
  };

  return (
    <View className="flex-1 bg-slate-100">
      <ListPageHeader
        title="Organizations"
        onAddPress={() => setShowAddForm(true)}
        onBackPress={() => (router.canGoBack() ? router.back() : router.replace('/screens/settings' as any))}
      />

      {/* Search Bar */}
      <View className="px-4 py-3 bg-slate-100">
        <InputField
          label=""
          placeholder="Search organizations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle="mb-0"
          inputStyle="bg-slate-50"
          leftIcon={<Ionicons name="search" size={20} color="#94a3b8" />}
        />
      </View>

      <View className="flex-1 bg-slate-100">
        {loading && displayOrganizations.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1AA3FF" />
          </View>
        ) : (
          <FlatList
            data={displayOrganizations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#1AA3FF" colors={['#1AA3FF']} />
            }
            ListEmptyComponent={
              <View className="py-8 items-center">
                <MaterialIcons name="business" size={48} color="#94a3b8" />
                <Text className="text-center text-lg mt-2 text-slate-500">No organizations found</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isCurrent = item.id === organization?.id;
              const badge = getStatusStyle(isCurrent ? 'Active' : 'Inactive');
              return (
                <Pressable
                  onPress={() => handleOpen(item)}
                  className="bg-white rounded-md mb-4 p-5 shadow-sm elevation-2"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
                        <Text className="text-2xl font-extrabold text-primary">
                          {item.name?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xl font-bold mb-1 text-slate-800" numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                    </View>

                    {/* Selected Badge */}
                    {isCurrent && (
                      <View className={`px-3 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
                        <Text className={`text-xs font-bold ${badge.text}`}>Selected</Text>
                      </View>
                    )}
                  </View>

                  {/* Divider */}
                  <View className="mt-4 pt-4 flex-row justify-between border-t border-slate-100">
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-bold text-slate-400">Industry</Text>
                      <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
                        {item.industry || '—'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-slate-400">Currency</Text>
                      <Text className="text-lg font-bold text-slate-800">{item.currency || '—'}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      <StandardModal visible={showAddForm} onClose={() => setShowAddForm(false)}>
        <OrganizationForm onCancel={() => setShowAddForm(false)} onSuccess={() => setShowAddForm(false)} />
      </StandardModal>
    </View>
  );
};

export default OrganizationList;
