import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { usePaymentList } from '@/hooks/payments/usePaymentList';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import PaymentForm from './PaymentForm';
import RefreshableScrollView from '../ui/RefreshableScrollView';
import StandardModal from '../ui/StandardModal';
import InputField from '../ui/InputField';

const PaymentList = () => {
  const {
    payments,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    refreshPayments,
    searchQuery,
    setSearchQuery,
    showAddForm,
    setShowAddForm,
    showEditForm,
    setShowEditForm,
    editingPayment,
    setEditingPayment,
    formLoading,
    handleSaveSuccess,
  } = usePaymentList();

  const router = useRouter();

  const getStatusStyle = (status: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      // Payment Modes
      case 'cash': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'cash' as const, hex: '#0891B2' };
      case 'bank transfer': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'business' as const, hex: '#0891B2' };
      case 'credit card': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'card' as const, hex: '#0891B2' };
      case 'check': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'document-text' as const, hex: '#0891B2' };
      case 'other': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'pricetag' as const, hex: '#0891B2' };
      default: return { bg: 'bg-primary/10', text: 'text-primary', icon: 'help-circle' as const, hex: '#0891B2' };
    }
  };

  const getCustomerName = (payment: any) => {
    if (payment.customer) {
      return payment.customer.displayName
    }
    return 'Unknown Customer';
  };

  return (
    <View className="flex-1 bg-slate-50">
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
          {[
            { key: 'all', label: 'All' },
            { key: 'Cash', label: 'Cash' },
            { key: 'Bank Transfer', label: 'Bank Transfer' },
            { key: 'Credit Card', label: 'Credit Card' },
            { key: 'Check', label: 'Check' },
            { key: 'Other', label: 'Other' },
          ].map((tab) => {
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
      {/* List */}
      <View className="flex-1 bg-slate-50">
        {loading && payments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0891B2" />
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
                tintColor="#0891B2"
                colors={["#0891B2"]}
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
                  onPress={() => {
                    router.push({
                      pathname: "/screens/payments/detail",
                      params: { payment: JSON.stringify(item) }
                    });
                  }}
                  className="bg-white rounded-xl mb-4 p-5 shadow-sm border border-slate-100"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
                        <Ionicons name="card-outline" size={24} color="#0891B2" />
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

      {/* Add Button */}
      < Pressable
        onPress={() => setShowAddForm(true)}
        className="p-4 rounded-full absolute right-5 bottom-8 bg-primary shadow-lg elevation-4"
      >
        <MaterialIcons name="add" size={28} color="white" />
      </Pressable >

      {/* Modals */}
      <StandardModal
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
      >
        <PaymentForm
          onSave={handleSaveSuccess}
          onCancel={() => setShowAddForm(false)}
          loading={formLoading}
        />
      </StandardModal>

      <StandardModal
        visible={showEditForm}
        onClose={() => setShowEditForm(false)}
      >
        <PaymentForm
          payment={editingPayment}
          onSave={handleSaveSuccess}
          onCancel={() => {
            setShowEditForm(false);
            setEditingPayment(null);
          }}
          loading={formLoading}
        />
      </StandardModal>
    </View>
  );
};

export default PaymentList;
