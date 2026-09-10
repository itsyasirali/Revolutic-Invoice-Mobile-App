import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { usePaymentList } from '@/hooks/payments/usePaymentList';
import { Ionicons } from '@expo/vector-icons';
import PaymentForm from './PaymentForm';
import StandardModal from '../ui/StandardModal';
import InputField from '../ui/InputField';
import ListPageHeader from '../ui/ListPageHeader';

const PaymentList = () => {
  const {
    payments,
    loading,
    refreshing,
    filter,
    setFilter,
    refreshPayments,
    searchQuery,
    setSearchQuery,
    showAddForm,
    showEditForm,
    editingPayment,
    formLoading,
    handleSaveSuccess,
    filterTabs,
    getStatusStyle,
    getCustomerName,
    handleOpenAdd,
    handleCloseAdd,
    handleCloseEdit,
    handlePaymentPress,
  } = usePaymentList();

  return (
    <View className="flex-1 bg-slate-50">
      <ListPageHeader title="Payments" onAddPress={handleOpenAdd} />

      {/* Search Bar */}
      <View className="px-4 py-3 bg-slate-50">
        <InputField
          label=""
          placeholder="Search payments..."
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
            const isActive = filter.toLowerCase() === tab.key.toLowerCase();
            return (
              <Pressable
                key={tab.key}
                onPress={() => setFilter(tab.key.toLowerCase() as any)}
                className={`px-5 py-2.5 mr-2 rounded-xl border ${isActive
                  ? "bg-primary border-primary"
                  : "bg-white border-slate-200"
                  }`}
              >
                <Text className={`font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <View className="flex-1 bg-slate-50">
        {loading && payments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1AA3FF" />
          </View>
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshPayments}
                tintColor="#1AA3FF"
                colors={["#1AA3FF"]}
              />
            }
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Ionicons name="cash-outline" size={48} color="#94a3b8" />
                <Text className="text-center text-lg mt-2 text-slate-500">
                  No payments found
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusStyle = getStatusStyle(item.paymentMode || item.status);
              return (
                <Pressable
                  onPress={() => handlePaymentPress(item)}
                  className="bg-white rounded-xl mb-4 p-5 shadow-sm border border-slate-100"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
                        <Ionicons name="card-outline" size={24} color="#1AA3FF" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-800">
                          {getCustomerName(item)}
                        </Text>
                        <Text className="text-sm text-slate-500">
                          {new Date(item.paymentDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View className={`px-3 py-1 rounded-full flex-row items-center ${statusStyle.bg}`}>
                      <Ionicons name={statusStyle.icon} size={12} color={statusStyle.hex} className="mr-1" />
                      <Text className={`text-xs font-bold ${statusStyle.text}`}>
                        {item.paymentMode || item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="mt-3 pt-3 flex-row justify-between border-t border-slate-100">
                    <View>
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Payment Date
                      </Text>
                      <Text className="text-base font-bold text-slate-800">
                        {new Date(item.paymentDate).toLocaleDateString()}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Amount
                      </Text>
                      <Text className="text-xl font-bold text-primary">
                        {item.currency} {Number(item.amountReceived ?? item.amount ?? 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Modals */}
      <StandardModal
        visible={showAddForm}
        onClose={handleCloseAdd}
      >
        <PaymentForm
          onSave={handleSaveSuccess}
          onCancel={handleCloseAdd}
          loading={formLoading}
        />
      </StandardModal>

      <StandardModal
        visible={showEditForm}
        onClose={handleCloseEdit}
      >
        <PaymentForm
          payment={editingPayment}
          onSave={handleSaveSuccess}
          onCancel={handleCloseEdit}
          loading={formLoading}
        />
      </StandardModal>
    </View>
  );
};

export default PaymentList;
