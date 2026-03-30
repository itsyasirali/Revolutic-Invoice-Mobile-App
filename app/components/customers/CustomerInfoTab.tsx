import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Customer } from '@/types/customer';

interface CustomerInfoTabProps {
    customerData: Customer;
    currency: string;
    firstContact: any;
    expandMoreInfo: boolean;
    setExpandMoreInfo: (val: boolean) => void;
    expandContacts: boolean;
    setExpandContacts: (val: boolean) => void;
    handleCall: (number?: string) => void;
    handleEmail: (email?: string) => void;
}

const CustomerInfoTab: React.FC<CustomerInfoTabProps> = ({
    customerData,
    currency,
    firstContact,
    expandMoreInfo,
    setExpandMoreInfo,
    expandContacts,
    setExpandContacts,
    handleCall,
    handleEmail,
}) => {
    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
            {/* Profile Card */}
            <View className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-slate-100">
                <View className="flex-row items-center mb-1">
                    <Ionicons name="person-outline" size={20} color="#64748b" />
                    <Text className="ml-2 text-2xl font-normal text-slate-800">
                        {customerData.displayName || customerData.companyName}
                    </Text>
                    <View className="ml-2 px-3 py-1.5 border border-slate-300 rounded">
                        <Text className="text-base text-slate-500 font-bold">{currency}</Text>
                    </View>
                </View>
                <Text className="ml-7 mt-2 text-base text-slate-500">
                    {customerData.contacts?.[0]?.email || 'No email'}
                </Text>

                {/* Action Buttons - Using First Contact Info */}
                <View className="flex-row justify-around pt-4">
                    <Pressable className="items-center" onPress={() => handleCall(firstContact?.contact)}>
                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mb-1">
                            <MaterialIcons name="smartphone" size={20} color="#0891B2" />
                        </View>
                        <Text className="text-sm text-primary font-medium">Call</Text>
                    </Pressable>
                    <Pressable className="items-center" onPress={() => handleEmail(firstContact?.email)}>
                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mb-1">
                            <MaterialIcons name="email" size={20} color="#0891B2" />
                        </View>
                        <Text className="text-sm text-primary font-medium">Email</Text>
                    </Pressable>
                </View>
            </View>

            {/* Accordion: More Information */}
            <View className="bg-white rounded-lg shadow-sm mb-4 border border-slate-100 overflow-hidden">
                <Pressable
                    onPress={() => setExpandMoreInfo(!expandMoreInfo)}
                    className="flex-row justify-between items-center p-4 bg-white"
                >
                    <View className="flex-row items-center">
                        <MaterialIcons name="grid-view" size={20} color="#475569" />
                        <Text className="ml-3 text-lg font-semibold text-slate-800">More Information</Text>
                    </View>
                    <MaterialIcons name={expandMoreInfo ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#64748b" />
                </Pressable>
                {expandMoreInfo && (
                    <View className="px-4 pb-4 bg-white">
                        <View className="flex-row py-2 border-b border-slate-50">
                            <Text className="text-slate-500 text-base flex-1">Company Name</Text>
                            <Text className="text-slate-800 text-base flex-1 text-right">{customerData.companyName || '-'}</Text>
                        </View>
                        <View className="flex-row py-2 border-b border-slate-50">
                            <Text className="text-slate-500 flex-1">Website</Text>
                            <Text className="text-slate-800 text-base flex-1 text-right">-</Text>
                        </View>
                        <View className="flex-row py-2">
                            <Text className="text-slate-500 flex-1">Address</Text>
                            <Text className="text-slate-800 text-base flex-1 text-right">{customerData.address || '-'}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Accordion: Contact Persons */}
            <View className="bg-white rounded-lg shadow-sm mb-4 border border-slate-100 overflow-hidden">
                <Pressable
                    onPress={() => setExpandContacts(!expandContacts)}
                    className="flex-row justify-between items-center p-4 bg-white"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="person-outline" size={20} color="#475569" />
                        <Text className="ml-3 text-lg font-semibold text-slate-800">Contact Persons ({customerData.contacts?.length || 0})</Text>
                    </View>
                    <MaterialIcons name={expandContacts ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#64748b" />
                </Pressable>
                {expandContacts && (
                    <View className="bg-white">
                        {customerData.contacts?.map((contact, idx) => (
                            <View key={idx} className="p-4 border-t border-slate-100">
                                <Text className="text-base font-bold text-slate-800">{contact.firstName} {contact.lastName}</Text>
                                <Text className="text-slate-500 text-base">{contact.email}</Text>
                                <Text className="text-slate-500 text-base">{contact.contact}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default CustomerInfoTab;
