import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

interface CustomerInvoicesTabProps {
    invoices: any[];
    currency: string;
    router: ReturnType<typeof useRouter>;
}

const CustomerInvoicesTab: React.FC<CustomerInvoicesTabProps> = ({
    invoices,
    currency,
    router,
}) => {
    return (
        <View className="flex-1 bg-white">
            <FlatList
                data={invoices}
                keyExtractor={(item) => item.id || item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: "/screens/Invoice/detail",
                                params: { invoice: JSON.stringify(item) }
                            });
                        }}
                        className="p-4 mb-3 border-b border-slate-100 flex-row justify-between items-center"
                    >
                        <View>
                            <Text className="text-xl text-primary font-bold">{item.invoiceNumber || item.invoice || '—'}</Text>
                            <Text className="text-slate-500 text-base mt-2">
                                {new Date(item.dueDate || item.invoiceDate || item.createdAt || item.date).toLocaleDateString()}
                            </Text>
                            <Text className="text-slate-500 text-base mt-1">
                                Due: {item.remaining} {item.currency}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-800 text-xl font-bold">
                                {Number(item.total || item.totalAmount || item.amount || 0).toFixed(2)} {item.currency || currency}
                            </Text>
                            <Text className={`text-base mt-1 font-medium ${(item.status || '').toLowerCase() === 'paid' ? 'text-green-500' :
                                (item.status || '').toLowerCase() === 'overdue' ? 'text-red-500' :
                                    'text-orange-500'
                                }`}>
                                {item.status || 'Draft'}
                            </Text>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">No invoices found</Text>}
            />
        </View>
    );
};

export default CustomerInvoicesTab;
