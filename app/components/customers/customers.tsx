import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import CustomerForm from './CustomerForm';
import useCustomerList from '@/hooks/customers/useCustomerList';
import InputField from '../ui/InputField';
import StandardModal from '../ui/StandardModal';
import ListPageHeader from '../ui/ListPageHeader';

const CustomerList = () => {
  const {
    loading,
    refreshing,
    filter,
    setFilter,
    showAddForm,
    searchQuery,
    setSearchQuery,
    displayCustomers,
    filterTabs,
    refetch,
    handleCustomerPress,
    handleCancelAdd,
    handleOpenAdd,
    handleSaveSuccess,
  } = useCustomerList();

  return (
    <View className="flex-1 bg-slate-50">
      <ListPageHeader title="Customers" onAddPress={handleOpenAdd} />


      {/* Search Bar */}
      <View className="px-4 py-3 bg-slate-50">
        <InputField
          label=""
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle="mb-0"
          inputStyle="bg-slate-50"
          leftIcon={<Ionicons name="search" size={20} color="#94a3b8" />}
        />
      </View>

      {/* Filter Tabs */}
      <View className="bg-slate-50 border-b border-gray-100 w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setFilter(tab.key as any)}
                className={`px-5 py-2.5 mr-2 rounded-xl border ${isActive
                  ? "bg-primary border-primary"
                  : "bg-white border-slate-200"
                  }`}
              >
                <Text
                  className={`font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1 bg-slate-50">
        {loading && displayCustomers.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1AA3FF" />
          </View>
        ) : (
          <FlatList
            data={displayCustomers}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refetch}
                tintColor="#1AA3FF"
                colors={["#1AA3FF"]}
              />
            }
            ListEmptyComponent={
              <View className="py-8 items-center">
                <MaterialIcons name="people-outline" size={48} color="#94a3b8" />
                <Text className="text-center text-lg mt-2 text-slate-500">
                  No {filter === 'all' ? '' : filter} customers found
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleCustomerPress(item)}
                className="bg-white rounded-xl mb-4 p-5 shadow-sm elevation-2"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
                      <Text className="text-2xl font-extrabold text-primary">
                        {item.displayName?.[0]?.toUpperCase()}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-xl font-bold mb-1 text-slate-800">
                        {item.displayName || item.companyName}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View
                    className={`px-3 py-1 rounded-full ${item.status === 'Active' ? 'bg-primary/10' : 'bg-orange-100' // Kept custom logic if needed, or revert to user's edit if I see it. 
                      } `}
                  >
                    <Text
                      className={`text-xs font-bold ${item.status === 'Active' ? 'text-primary' : 'text-orange-700'
                        } `}
                    >
                      {item.status || 'Active'}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="mt-4 pt-4 flex-row justify-between border-t border-slate-100">
                  <View>
                    <Text className="text-sm font-bold text-slate-400">
                      Received
                    </Text>
                    <Text className="text-lg font-bold text-slate-800">
                      {item.currency} {item.unusedCredits || 0}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold text-slate-400">
                      Remaining
                    </Text>
                    <Text className="text-lg font-bold text-slate-800">
                      {item.currency} {item.receivables || 0}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      <StandardModal
        visible={showAddForm}
        onClose={handleCancelAdd}
      >
        <CustomerForm
          customer={null}
          onCancel={handleCancelAdd}
          onSaveSuccess={handleSaveSuccess}
        />

      </StandardModal>
    </View>
  );
};

export default CustomerList;
