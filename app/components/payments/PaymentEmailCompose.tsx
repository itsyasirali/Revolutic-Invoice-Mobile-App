import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentEmail } from '@/hooks/payments/usePaymentEmail';
import InputField from '../ui/InputField';
import StandardModal from '../ui/StandardModal';
import StandardButton from '../ui/StandardButton';

const PaymentEmailCompose = () => {
    const params = useLocalSearchParams();
    const { paymentId, paymentData } = params;

    const {
        payment,
        loading,
        sending,
        emailData,
        availableEmails,
        handleSend,
        addEmail,
        removeEmail,
        updateSubject,
        updateMessage,
        router
    } = usePaymentEmail(paymentId as string, paymentData);

    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [addingTo, setAddingTo] = useState<'to' | 'cc' | 'bcc'>('to');
    const [newEmailInput, setNewEmailInput] = useState('');

    const openEmailSelector = (type: 'to' | 'cc' | 'bcc') => {
        setAddingTo(type);
        setShowRecipientModal(true);
    };

    const handleAddCustomEmail = () => {
        if (newEmailInput.trim() && newEmailInput.includes('@')) {
            addEmail(addingTo, newEmailInput.trim());
            setNewEmailInput('');
            setShowRecipientModal(false);
        }
    };

    const handleAddEmailFromList = (email: string) => {
        addEmail(addingTo, email);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#0891B2" />
            </SafeAreaView>
        );
    }

    if (!payment) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-red-500 text-lg">Payment not found</Text>
                <StandardButton
                    title="Go Back"
                    onPress={() => router.back()}
                    variant="secondary"
                    className="mt-4"
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View className="flex-row items-center justify-between px-4 pt-8 py-3 border-b border-gray-100 bg-white">
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </Pressable>
                    <Text className="text-xl font-bold text-slate-800">Email Receipt</Text>
                    <Pressable onPress={handleSend} disabled={sending}>
                        {sending ? <ActivityIndicator size="small" color="#0891B2" /> : <Ionicons name="send" size={24} color="#0891B2" />}
                    </Pressable>
                </View>

                <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                    {/* To Recipients */}
                    <View className="border-b border-gray-100 px-4 py-3">
                        <View className="flex-row items-start justify-between">
                            <Text className="text-slate-500 mt-2 font-medium w-8">To</Text>
                            <View className="flex-1 flex-row flex-wrap mx-2">
                                {emailData.to.map((email, idx) => (
                                    <View key={idx} className="bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mr-2 mb-1 flex-row items-center">
                                        <Text className="text-teal-700 text-sm">{email}</Text>
                                        <Pressable onPress={() => removeEmail('to', idx)} className="ml-2">
                                            <Ionicons name="close-circle" size={16} color="#0f766e" />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                            <Pressable onPress={() => openEmailSelector('to')} className="bg-teal-50 p-2 rounded-full">
                                <Ionicons name="add" size={20} color="#0891B2" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Subject */}
                    <View className="px-4 py-2 border-b border-gray-100">
                        <InputField
                            label="Subject"
                            value={emailData.subject}
                            onChangeText={updateSubject}
                            containerStyle="mb-0"
                            inputStyle="text-slate-800 font-medium text-base flex-1"
                        />
                    </View>

                    {/* Message */}
                    <View className="px-4 py-2">
                        <InputField
                            label="Message"
                            value={emailData.message}
                            onChangeText={updateMessage}
                            multiline
                            numberOfLines={10}
                            containerStyle="mb-2"
                            inputStyle="text-slate-800 text-base flex-1 min-h-[200px] text-top"
                            placeholder="Enter your message here..."
                        />
                    </View>

                    {/* Attachment Badge */}
                    <View className="px-4 pb-4">
                        <View className="flex-row items-center py-2 bg-slate-50 px-3 rounded-lg border border-slate-100 self-start">
                            <Ionicons name="document-text" size={20} color="#ef4444" />
                            <Text className="text-slate-700 ml-2 font-medium">Payment-Receipt.pdf</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Email Selector Modal */}
                <StandardModal
                    visible={showRecipientModal}
                    onClose={() => setShowRecipientModal(false)}
                >
                    <View className="flex-1 p-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-slate-800">Add Email</Text>
                            <Pressable onPress={() => setShowRecipientModal(false)}>
                                <Ionicons name="close" size={24} color="#1e293b" />
                            </Pressable>
                        </View>

                        {/* Custom Email Input */}
                        <View className="mb-6">
                            <InputField
                                placeholder="Enter email address"
                                value={newEmailInput}
                                onChangeText={setNewEmailInput}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                containerStyle="mb-4"
                            />
                            <StandardButton
                                title="Add Email"
                                onPress={handleAddCustomEmail}
                            />
                        </View>

                        {/* Available Emails */}
                        {availableEmails.length > 0 && (
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-slate-500 mb-2 uppercase">Suggested Emails</Text>
                                <ScrollView
                                    className="flex-1"
                                    showsVerticalScrollIndicator={true}
                                >
                                    {availableEmails.map((email, idx) => (
                                        <Pressable
                                            key={idx}
                                            onPress={() => {
                                                handleAddEmailFromList(email);
                                                setShowRecipientModal(false);
                                            }}
                                            className="border-b border-gray-100 py-3.5 px-2 active:bg-slate-50 rounded-lg"
                                        >
                                            <Text className="text-slate-700 text-base">{email}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </StandardModal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PaymentEmailCompose;
