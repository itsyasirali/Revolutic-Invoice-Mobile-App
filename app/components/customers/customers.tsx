import React from 'react';
import { View, Text, Pressable, Modal, TextInput, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomerForm from './CustomerForm';
import RefreshableScrollView from '../ui/RefreshableScrollView';
import { useCustomerList } from '@/hooks/customers/useCustomerList';
import InputField from '../ui/InputField';
import StandardModal from '../ui/StandardModal';
import ListPageHeader from '../ui/ListPageHeader';

const CustomerList = () => {
  const {
    loading,
    filter,
    setFilter,
    showAddForm,
    setShowAddForm,
    searchQuery,
    setSearchQuery,
    displayCustomers,
    refetch,
    handleCustomerPress,
    handleCancelAdd,
  } = useCustomerList();

  return (
    <>
      <ListPageHeader title="Customers" onAddPress={() => setShowAddForm(true)} />

      <View
        className="px-4 py-3 bg-slate-50"
      >
        <InputField
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle="mb-0"
        />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-2 bg-slate-50">
        {(['all', 'active', 'inactive'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab as any)}
              className={`px-4 py-3 mx-1 rounded-xl flex-row items-center border ${isActive
                ? "bg-primary border-primary"
                : "bg-white border-slate-200"
                } `}
            >
              <Text
                className={`font - bold mr - 2 ${isActive ? 'text-white' : 'text-slate-600'} `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          );
        })}
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
                refreshing={loading}
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
          onCancel={() => {
            handleCancelAdd();
            refetch();
          }}
        />
      </StandardModal>
    </>
  );
};

export default CustomerList;
