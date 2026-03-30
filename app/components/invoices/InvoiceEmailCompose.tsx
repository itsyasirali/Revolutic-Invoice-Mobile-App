import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInvoiceEmail } from '@/hooks/invoices/useInvoiceEmail';

const InvoiceEmailCompose = () => {
    const params = useLocalSearchParams();
    const invoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
    const initialData = params.invoiceData;

    const {
        invoice,
        loading,
        sending,
        emailData,
        availableEmails,
        isKeyboardVisible,
        handleSend,
        addEmail,
        removeEmail,
        updateMessage,
        toggleAttachPDF,
        router
    } = useInvoiceEmail(invoiceId, initialData);

    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [newEmailInput, setNewEmailInput] = useState('');
    const [addingTo, setAddingTo] = useState<'to' | 'cc' | 'bcc'>('to');

    const openEmailSelector = (type: 'to' | 'cc' | 'bcc') => {
        setAddingTo(type);
        setShowRecipientModal(true);
    };

    const handleAddEmailFromList = (email: string) => {
        addEmail(addingTo, email);
    };

    const handleAddCustomEmail = () => {
        if (newEmailInput.trim() && newEmailInput.includes('@')) {
            addEmail(addingTo, newEmailInput.trim());
            setNewEmailInput('');
            setShowRecipientModal(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0891B2" />
                </View>
            </SafeAreaView>
        );
    }

    if (!invoice) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-red-500 text-lg">Invoice not found</Text>
                    <Pressable onPress={() => router.back()} className="mt-4 bg-gray-200 p-3 rounded-lg">
                        <Text>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-8 py-3 border-b border-gray-200">
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text className="text-xl font-bold">Email</Text>
                <Pressable onPress={handleSend} disabled={sending}>
                    {sending ? (
                        <ActivityIndicator size="small" color="#0891B2" />
                    ) : (
                        <Ionicons name="send" size={24} color="#0891B2" />
                    )}
                </Pressable>
            </View>


            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: isKeyboardVisible ? 370 : 20 }}
            >
                {/* From */}
                <View className="border-b border-gray-200 px-4 py-3 flex-row items-center">
                    <Text className="w-16 text-gray-600">From</Text>
                    <Text className="flex-1 text-gray-800">{emailData.from}</Text>
                </View>

                {/* To */}
                <View className="border-b border-gray-200 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600">To</Text>
                        <View className="flex-1 flex-row flex-wrap mx-3">
                            {emailData.to.map((email, idx) => (
                                <View key={idx} className="bg-teal-100 px-3 py-1 rounded-full mr-2 mb-1 flex-row items-center">
                                    <Text className="text-primary text-sm">{email}</Text>
                                    <Pressable onPress={() => removeEmail('to', idx)} className="ml-2">
                                        <Ionicons name="close-circle" size={16} color="#0891B2" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                        <Pressable onPress={() => openEmailSelector('to')} className="bg-teal-100 p-2 rounded-full">
                            <Ionicons name="add" size={20} color="#0891B2" />
                        </Pressable>
                    </View>
                </View>

                {/* Cc */}
                <View className="border-b border-gray-200 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600">Cc</Text>
                        <View className="flex-1 flex-row flex-wrap mx-3">
                            {emailData.cc.map((email, idx) => (
                                <View key={idx} className="bg-teal-100 px-3 py-1 rounded-full mr-2 mb-1 flex-row items-center">
                                    <Text className="text-primary text-sm">{email}</Text>
                                    <Pressable onPress={() => removeEmail('cc', idx)} className="ml-2">
                                        <Ionicons name="close-circle" size={16} color="#0891B2" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                        <Pressable onPress={() => openEmailSelector('cc')} className="bg-teal-100 p-2 rounded-full">
                            <Ionicons name="add" size={20} color="#0891B2" />
                        </Pressable>
                    </View>
                </View>

                {/* Bcc */}
                <View className="border-b border-gray-200 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600">Bcc</Text>
                        <View className="flex-1 flex-row flex-wrap mx-3">
                            {emailData.bcc.map((email, idx) => (
                                <View key={idx} className="bg-teal-100 px-3 py-1 rounded-full mr-2 mb-1 flex-row items-center">
                                    <Text className="text-primary text-sm">{email}</Text>
                                    <Pressable onPress={() => removeEmail('bcc', idx)} className="ml-2">
                                        <Ionicons name="close-circle" size={16} color="#0891B2" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                        <Pressable onPress={() => openEmailSelector('bcc')} className="bg-teal-100 p-2 rounded-full">
                            <Ionicons name="add" size={20} color="#0891B2" />
                        </Pressable>
                    </View>
                </View>

                {/* Subject */}
                <View className="border-b border-gray-200 px-4 py-3 flex-row items-center">
                    <Text className="w-16 text-gray-600">Subject</Text>
                    <Text className="flex-1 text-gray-800">{emailData.subject}</Text>
                </View>

                {/* Editable Message */}
                <View className="p-4">
                    <Text className="text-gray-700 font-semibold mb-2">Message</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
                        multiline
                        numberOfLines={15}
                        value={emailData.message}
                        onChangeText={updateMessage}
                        style={{ minHeight: 200, textAlignVertical: 'top' }}
                    />
                </View>

                {/* Attachments */}
                <View className="px-4 pb-4">
                    <Pressable
                        onPress={toggleAttachPDF}
                        className="flex-row items-center py-3"
                    >
                        <View className={`w-6 h-6 border-2 rounded mr-3 items-center justify-center ${emailData.attachPDF ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                            {emailData.attachPDF && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="text-gray-800">Attach Invoice PDF</Text>
                    </Pressable>

                    {emailData.attachPDF && (
                        <View className="flex-row items-center py-2 pl-9">
                            <Ionicons name="document" size={20} color="#ef4444" />
                            <Text className="text-red-600 ml-2">{invoice.invoiceNumber}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Email Selector Modal */}
            <Modal
                visible={showRecipientModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRecipientModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold">Add Email</Text>
                            <Pressable onPress={() => setShowRecipientModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </Pressable>
                        </View>

                        {/* Custom Email Input */}
                        <View className="mb-4">
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 mb-2"
                                placeholder="Enter email address"
                                value={newEmailInput}
                                onChangeText={setNewEmailInput}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={handleAddCustomEmail}
                                className="bg-primary py-3 rounded-lg"
                            >
                                <Text className="text-white text-center font-bold">Add Email</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default InvoiceEmailCompose;
