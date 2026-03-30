
import React from "react";
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import usePaymentDetails from "@/hooks/payments/usePaymentDetails";
import PaymentForm from "./PaymentForm";
import StandardModal from "../ui/StandardModal";

const PaymentDetail: React.FC = () => {
    const {
        paymentData,
        loading,
        showEditForm,
        setShowEditForm,
        showMenu,
        setShowMenu,
        handleSaveSuccess,
        handleDelete,
        handleDownloadReceipt,
        handleEdit,
        handlePreview,
        handleSendEmail,
        goBack
    } = usePaymentDetails();

    if (!paymentData) {
        return (
            <View className="flex-1 p-4 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#0891B2" />
            </View>
        );
    }

    const getStatusStyle = (status: string) => {
        const normalizedStatus = (status || '').toLowerCase();
        switch (normalizedStatus) {
            case 'cash': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'cash' as const, hex: '#047857' };
            case 'bank transfer': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'business' as const, hex: '#1d4ed8' };
            case 'credit card': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'card' as const, hex: '#7e22ce' };
            case 'check': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'document-text' as const, hex: '#0f766e' };
            case 'other': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'pricetag' as const, hex: '#374151' };
            default: return { bg: 'bg-primary/10', text: 'text-primary', icon: 'help-circle' as const, hex: '#374151' };
        }
    };


    const statusStyle = getStatusStyle(paymentData.paymentMode);

    const renderHeaderStats = () => (
        <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
            <View className="flex-1 pl-4">
                <Text className="text-slate-500 text-sm uppercase mb-1">Amount Received</Text>
                <Text className="text-2xl font-bold text-slate-800">
                    {paymentData.currency} {Number(paymentData.amountReceived || 0).toFixed(2)}
                </Text>
            </View>
            <View className="flex-1 pr-4 border-l pl-4 border-slate-400">
                <Text className="text-slate-500 text-sm uppercase mb-1">Payment Date</Text>
                <Text className="text-xl font-bold text-slate-700">
                    {new Date(paymentData.paymentDate).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    const renderDetails = () => (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            {/* Customer Profile Card */}
            <View className="bg-white rounded-2xl mb-4 border border-primary/20 p-5">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                        <Text className="text-xl font-black text-primary">
                            {(paymentData.customerDisplayName || paymentData.customer?.id || 'C')?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-800">
                            {paymentData.customerDisplayName || paymentData.customer?.displayName || 'Unknown Customer'}
                        </Text>
                        {(() => {
                            const email = paymentData.customerEmail ||
                                (typeof paymentData.customerId === 'object' ?
                                    (paymentData.customerId?.email || paymentData.customerId?.contacts?.[0]?.email) : '');

                            if (email) {
                                return (
                                    <Text className="text-sm text-slate-600 font-medium">
                                        {email}
                                    </Text>
                                );
                            }
                            return null;
                        })()}
                    </View>
                </View>
            </View>

            {/* Metadata Card */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                <View className="flex-row justify-between items-start mb-6">
                    <View>
                        <Text className="text-slate-500 text-sm mb-1">
                            Payment Date: <Text className="font-bold text-slate-800">{new Date(paymentData.paymentDate).toLocaleDateString()}</Text>
                        </Text>
                        <Text className="text-slate-400 text-xs">Ref: {paymentData.reference || 'N/A'}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-bl-xl rounded-tr-xl ${statusStyle.bg}`}>
                        <Text className={`text-xs font-bold uppercase ${statusStyle.text} tracking-wider`}>
                            {paymentData.paymentMode}
                        </Text>
                    </View>
                </View>

                <View className="flex-row">
                    <View className="flex-1">
                        <Text className="text-slate-400 text-xs mb-1 font-medium">Payment#</Text>
                        <Text className="text-slate-800 font-bold text-lg">{paymentData.paymentNumber || `#${paymentData.id.slice(-6)}`}</Text>
                    </View>
                </View>
            </View>

            {/* Applied Invoices List */}
            {paymentData.appliedInvoices && paymentData.appliedInvoices.length > 0 && (
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text className="font-bold text-lg mb-4 text-slate-800">Applied Invoices ({paymentData.appliedInvoices.length})</Text>
                    {paymentData.appliedInvoices.map((item: any, index: number) => (
                        <View key={index} className="flex-row justify-between items-start py-4 border-b border-slate-50 last:border-0">
                            <View className="flex-1 pr-4">
                                <Text className="font-bold text-slate-800 text-base mb-1">
                                    {item.invoice?.invoiceNumber || item.invoiceNumber || 'Unknown Invoice'}
                                </Text>
                                <Text className="text-slate-500 text-sm">
                                    Total Invoice: {paymentData.currency} {Number(item.invoice?.total || item.invoiceAmount || 0).toFixed(2)}
                                </Text>
                            </View>
                            <Text className="font-bold text-slate-800 text-base">
                                {paymentData.currency}{Number(item.amount || 0).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Totals Card */}
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
                <View className="flex-row justify-between pt-1">
                    <Text className="text-slate-800 font-bold text-xl">Amount Received</Text>
                    <Text className="text-slate-800 font-bold text-xl">{paymentData.currency}{Number(paymentData.amountReceived || 0).toFixed(2)}</Text>
                </View>
                {/* Optional: Show Unused Amount if we can calculate it easily, otherwise skip for now to stay clean */}
            </View>

            {/* More Information (Notes) */}
            <View className="mb-8">
                <Text className="font-bold text-lg text-slate-800 mb-3 ml-1">More Information</Text>
                {paymentData.notes ? (
                    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <Text className="text-slate-700 text-base leading-6">{paymentData.notes}</Text>
                    </View>
                ) : (
                    <Text className="text-slate-400 italic ml-1">No additional notes.</Text>
                )}
            </View>
        </ScrollView>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Top Header */}
            <View className="flex-row items-center p-4 pt-8 bg-slate-100">
                <Pressable onPress={goBack} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
                </Pressable>
                <Text className="text-2xl font-normal text-slate-800 flex-1" numberOfLines={1}>
                    Payment
                </Text>
                <View className="flex-row">
                    <Pressable className="p-2" onPress={handleEdit}>
                        <MaterialIcons name="edit" size={24} color="#64748b" />
                    </Pressable>
                    <Pressable className="p-2" onPress={() => setShowMenu(true)}>
                        <MaterialIcons name="more-vert" size={24} color="#64748b" />
                    </Pressable>
                </View>
            </View>

            {renderHeaderStats()}
            {renderDetails()}

            {/* Edit Modal */}
            <StandardModal
                visible={showEditForm}
                onClose={() => setShowEditForm(false)}
            >
                <PaymentForm
                    payment={paymentData}
                    onSave={handleSaveSuccess}
                    onCancel={() => setShowEditForm(false)}
                    loading={loading}
                />
            </StandardModal>

            {/* Menu Modal */}
            <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }} onPress={() => setShowMenu(false)}>
                    <View className="absolute top-3 right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]">
                        <Pressable
                            onPress={handleSendEmail}
                            className="flex-row items-center justify-between px-4 py-3.5"
                        >
                            <Text className="text-base text-slate-800">Send Email</Text>
                        </Pressable>

                        <View className="h-[1px] bg-slate-100 my-1" />

                        <Pressable
                            onPress={handlePreview}
                            className="flex-row items-center justify-between px-4 py-3.5"
                        >
                            <Text className="text-base text-slate-800">Preview</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleDownloadReceipt}
                            className="flex-row items-center justify-between px-4 py-3.5"
                        >
                            <Text className="text-base text-slate-800">Download Receipt</Text>
                            {loading && <ActivityIndicator size="small" color="#2563eb" />}
                        </Pressable>

                        <View className="h-[1px] bg-slate-100 my-1" />

                        <Pressable onPress={handleDelete} className="px-4 py-3.5">
                            <Text className="text-base text-red-600">Delete</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default PaymentDetail;
