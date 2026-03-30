import React, { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { UIInvoiceListItem } from '@/types/invoice';

const RecentTransactions = () => {
    const router = useRouter();
    const { invoices, loading: invoicesLoading } = useInvoiceList();

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const recentInvoices = useMemo(() => {
        return [...invoices]
            .sort((a, b) => new Date(b.raw?.createdAt || b.date || new Date()).getTime() - new Date(a.raw?.createdAt || a.date || new Date()).getTime())
            .slice(0, 5);
    }, [invoices]);

    const getStatusStyle = (status: string) => {
        const lowerStatus = (status || '').toLowerCase();

        // Default styles
        let styles = { text: 'text-primary', bg: 'bg-primary/10' };

        // Extract status string if it's an object from UIInvoiceListItem
        if (typeof status === 'object' && (status as any).tooltip) {
            const color = (status as any).color;
            if (color === 'success') styles = { text: 'text-green-600', bg: 'bg-green-100' };
            else if (color === 'danger') styles = { text: 'text-red-600', bg: 'bg-red-100' };
            else styles = { text: 'text-yellow-600', bg: 'bg-yellow-100' };
            return styles;
        }

        switch (lowerStatus) {
            case 'paid':
            case 'pending':
            case 'sent':
            case 'partially paid':
            case 'draft':
                styles = { text: 'text-primary', bg: 'bg-primary/10' };
                break;
            case 'overdue':
                styles = { text: 'text-red-600', bg: 'bg-red-100' };
                break;
            default:
                styles = { text: 'text-primary', bg: 'bg-primary/10' };
                break;
        }
        return styles;
    };

    if (invoicesLoading) {
        return (
            <View className="p-5 bg-white rounded-2xl mb-5 shadow-sm min-h-[150px] justify-center items-center">
                <ActivityIndicator size="small" color="#0891B2" />
            </View>
        );
    }

    return (
        <View className="bg-white p-5 rounded-2xl mb-5 shadow-sm elevation-2">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-800">Recent Transactions</Text>
                <Pressable onPress={() => router.push('/screens/Invoice/invoices' as any)}>
                    <Text className="text-primary font-semibold text-sm">See All</Text>
                </Pressable>
            </View>

            {recentInvoices.length === 0 ? (
                <View className="py-8 items-center">
                    <Text className="text-slate-400 text-sm">No recent transactions</Text>
                </View>
            ) : (
                <View>
                    {recentInvoices.map((invoice, index) => {
                        const invoiceData = (invoice.raw || invoice) as any;
                        const statusStyle = getStatusStyle(invoice.status as any);
                        const customerName = invoiceData.customer?.displayName || invoiceData.customerName || invoiceData.customerDisplayName || (typeof invoiceData.customerId === 'object' ? invoiceData.customerId?.displayName : 'Unknown Customer');

                        return (
                            <Pressable
                                key={invoice.id || index}
                                className="flex-row justify-between items-center py-3 border-b border-slate-100 last:border-0"
                                onPress={() => {
                                    router.push({
                                        pathname: '/screens/Invoice/detail',
                                        params: { invoice: JSON.stringify(invoiceData) }
                                    });
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center mr-3">
                                        <Ionicons name="receipt-outline" size={20} color="#0891B2" />
                                    </View>
                                    <View className="flex-1 mr-2">
                                        <View>
                                            <Text className="text-base font-semibold text-slate-800" numberOfLines={1}>
                                                {customerName}
                                            </Text>
                                        </View>
                                        <Text className="text-sm text-slate-500">
                                            {formatDate(invoice.date)}
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Text className="text-base font-bold text-slate-800 mb-1">
                                        {invoice.currency} {Number(invoice.amount ?? 0).toFixed(2)}
                                    </Text>
                                    <View className={`px-3 py-1 rounded-lg ${statusStyle.bg}`}>
                                        <Text className={`text-xs font-bold uppercase ${statusStyle.text}`}>
                                            {(invoice.status as any).tooltip || invoice.status}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        )
                    })}
                </View>
            )}
        </View>
    );
};

export default RecentTransactions;
