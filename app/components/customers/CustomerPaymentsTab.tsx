import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Customer } from '@/types/customer';

interface CustomerPaymentsTabProps {
    payments: any[];
    currency: string;
    customerData: Customer;
    router: ReturnType<typeof useRouter>;
}

const CustomerPaymentsTab: React.FC<CustomerPaymentsTabProps> = ({
    payments,
    currency,
    customerData,
    router,
}) => {
    return (
        <View className="flex-1 bg-white">
            <FlatList
                data={payments}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }: { item: any }) => (
                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: "/screens/payments/detail",
                                params: {
                                    payment: JSON.stringify({
                                        ...item,
                                        customerDisplayName: customerData.displayName || customerData.companyName
                                    })
                                }
                            });
                        }}
                        className="p-4 mb-3 border-b border-slate-100 flex-row justify-between items-center"
                    >
                        <View>
                            <Text className="font-bold text-xl text-primary">{item.paymentNumber ? `PMT-${item.paymentNumber}` : (item.referenceNo || 'Payment')}</Text>
                            <Text className="text-slate-500 text-base mt-2">{new Date(item.paymentDate).toLocaleDateString()}</Text>
                            <Text className="text-slate-500 text-base mt-1">
                                Mode: {item.paymentMode}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="font-bold text-slate-800 text-xl">
                                {item.currency || currency} {Number(item.amountReceived || item.amount || 0).toFixed(2)}
                            </Text>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">No payments found</Text>}
            />
        </View>
    );
};

export default CustomerPaymentsTab;
