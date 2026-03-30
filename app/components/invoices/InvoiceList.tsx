import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import InvoiceForm from './InvoiceForm';

import InputField from '../ui/InputField';
import StandardModal from '../ui/StandardModal';

const InvoiceList = () => {
    const {
        invoices,
        loading,
        refreshing,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        refreshInvoices,
        showAddForm,
        setShowAddForm,
        showEditForm,
        editingInvoice,
        handleCancel
    } = useInvoiceList();

    const router = useRouter();

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'paid': return { bg: 'bg-primary/10', text: 'text-primary' };
            case 'sent': return { bg: 'bg-primary/10', text: 'text-primary' };
            case 'draft': return { bg: 'bg-primary/10', text: 'text-primary' };
            case 'overdue': return { bg: 'bg-red-100', text: 'text-red-700' };
            case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Search Bar */}
            <View className="px-4 py-3 bg-slate-50">
                <InputField
                    label=""
                    placeholder="Search invoices..."
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
                        { key: 'Draft', label: 'Draft' },
                        { key: 'Sent', label: 'Sent' },
                        { key: 'Paid', label: 'Paid' },
                        { key: 'Partially Paid', label: 'Partially Paid' },
                        { key: 'Overdue', label: 'Overdue' },
                        { key: 'Cancelled', label: 'Cancelled' },
                    ].map((tab) => {
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
                {loading && invoices.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#0891B2" />
                        <Text className="text-center text-slate-600 mt-2">Loading...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={invoices}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={refreshInvoices}
                                tintColor="#0891B2"
                                colors={['#0891B2']}
                            />
                        }
                        ListEmptyComponent={
                            <View className="py-8 items-center">
                                <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
                                <Text className="text-center text-lg mt-2 text-slate-500">
                                    No {filter === 'all' ? '' : filter} invoices found
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const statusStyle = getStatusStyle(item.status);
                            return (
                                <Pressable
                                    onPress={() => {
                                        const invoice = item as any;
                                        const templateData = (invoice.raw?.templateId && typeof invoice.raw.templateId === 'object') ? invoice.raw.templateId : null;
                                        router.push({
                                            pathname: "/screens/Invoice/detail",
                                            params: {
                                                invoiceData: JSON.stringify(invoice.raw || invoice),
                                                template: templateData ? JSON.stringify(templateData) : undefined
                                            }
                                        });
                                    }}
                                    className="bg-white rounded-xl mb-4 p-5 shadow-sm border border-slate-100"
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center flex-1">
                                            <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
                                                <Ionicons name="receipt-outline" size={24} color="#0891B2" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-lg font-bold text-slate-800">
                                                    {item.invoiceNumber}
                                                </Text>
                                                <Text className="text-sm text-slate-500">
                                                    {item.customerName}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Status Badge */}
                                        <View className={`px-3 py-1 rounded-full flex-row items-center ${statusStyle.bg}`}>
                                            <Text className={`text-xs font-bold ${statusStyle.text}`}>
                                                {(item.status as any).tooltip || item.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View className="mt-3 pt-3 flex-row justify-between border-t border-slate-100">
                                        <View>
                                            <Text className="text-xs font-bold text-slate-400 uppercase">
                                                Due Date
                                            </Text>
                                            <Text className="text-base font-bold text-slate-800">
                                                {new Date(item.dueDate).toLocaleDateString()}
                                            </Text>
                                        </View>

                                        <View className="items-end">
                                            <Text className="text-xs font-bold text-slate-400 uppercase">
                                                Total
                                            </Text>
                                            <Text className="text-xl font-bold text-primary">
                                                {item.currency} {Number(item.amount || 0).toFixed(2)}
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
            <Pressable
                onPress={() => setShowAddForm(true)}
                className="p-4 rounded-full absolute right-5 bottom-8 bg-primary shadow-lg elevation-4"
            >
                <MaterialIcons name="add" size={28} color="white" />
            </Pressable>

            {/* Modals */}
            <StandardModal visible={showAddForm} onClose={handleCancel}>
                <InvoiceForm
                    onCancel={handleCancel}
                    onSaveSuccess={() => {
                        handleCancel();
                        refreshInvoices();
                    }}
                />
            </StandardModal>

            <StandardModal visible={showEditForm} onClose={handleCancel}>
                {editingInvoice && (
                    <InvoiceForm
                        initialData={editingInvoice}
                        onCancel={handleCancel}
                        onSaveSuccess={() => {
                            handleCancel();
                            refreshInvoices();
                        }}
                    />
                )}
            </StandardModal>
        </View>
    );
}

export default InvoiceList;
