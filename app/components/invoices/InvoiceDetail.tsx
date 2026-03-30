import React from "react";
import RenderHtml from 'react-native-render-html';
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from "react-native";
import InvoiceForm from "./InvoiceForm";
import { useInvoiceDetails } from "@/hooks/invoices/useInvoiceDetails";
import StandardModal from "../ui/StandardModal";
import DownloadPopIn from '../ui/DownloadPopIn';

const InvoiceDetail: React.FC = () => {
    const {
        loading,
        invoiceData,
        showEditForm,
        showMenu,
        expandMoreInfo,
        setShowEditForm,
        setShowMenu,
        setExpandMoreInfo,
        handleSaveSuccess,
        handleDelete,
        handleDownloadPDF,
        downloadSuccess,
        setDownloadSuccess,
        downloadFileName,
        router,
        width
    } = useInvoiceDetails();

    const [hasStoragePermission, setHasStoragePermission] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        // Initial setup if needed
    }, []);

    const onDownloadPress = async () => {
        handleDownloadPDF();
    };



    if (!invoiceData) {
        return (
            <View className="flex-1 p-4 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#0891B2" />
            </View>
        );
    }


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

    const statusStyle = getStatusStyle(invoiceData.status);

    const renderHeaderStats = () => (
        <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
            <View className="flex-1 pl-4">
                <Text className="text-slate-500 text-sm uppercase mb-1">Total Amount</Text>
                <Text className="text-2xl font-bold text-slate-800">
                    {invoiceData.currency} {Number(invoiceData.total || 0).toFixed(2)}
                </Text>
            </View>
            <View className="flex-1 pr-4 border-l pl-4 border-slate-400">
                <Text className="text-slate-500 text-sm uppercase mb-1">Balance Due</Text>
                <Text className="text-2xl font-bold text-red-600">
                    {invoiceData.currency} {Number(invoiceData.remaining || 0).toFixed(2)}
                </Text>
            </View >
        </View >
    );

    // Details tab content
    const renderDetails = () => (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            {/* Customer Profile Card */}
            <View className="bg-white rounded-2xl mb-4 border border-primary/20 p-5">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                        <Text className="text-xl font-black text-primary">
                            {(invoiceData.customer?.displayName || invoiceData.customerDisplayName || invoiceData.customerName || (typeof invoiceData.customerId === 'object' ? invoiceData.customerId?.displayName : 'C'))?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-800">
                            {invoiceData.customer?.displayName || invoiceData.customerDisplayName || invoiceData.customerName || (typeof invoiceData.customerId === 'object' ? invoiceData.customerId?.displayName : 'Unknown')}
                        </Text>

                        {(() => {
                            const email = invoiceData.customer?.contacts?.[0]?.email || invoiceData.customerEmail ||
                                (typeof invoiceData.customerId === 'object' ?
                                    (invoiceData.customerId?.email || invoiceData.customerId?.contacts?.[0]?.email) : '');

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

            {/* New Metadata Card (Design Match) */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                <View className="flex-row justify-between items-start mb-6">
                    <View>
                        <Text className="text-slate-500 text-sm mb-1">
                            Due on: <Text className="font-bold text-slate-800">{new Date(invoiceData.dueDate).toLocaleDateString()}</Text>
                        </Text>
                        <Text className="text-slate-400 text-xs">Terms: Due on Receipt</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-bl-xl rounded-tr-xl ${statusStyle.bg}`}>
                        <Text className={`text-xs font-bold uppercase ${statusStyle.text} tracking-wider`}>
                            {invoiceData.status}
                        </Text>
                    </View>
                </View>

                <View className="flex-row">
                    <View className="flex-1">
                        <Text className="text-slate-400 text-xs mb-1 font-medium">Invoice#</Text>
                        <Text className="text-slate-800 font-bold text-lg">{invoiceData.invoiceNumber}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-400 text-xs mb-1 font-medium">Invoice Date</Text>
                        <Text className="text-slate-800 font-bold text-lg">{new Date(invoiceData.invoiceDate).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>

            {/* Items Card */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                <Text className="font-bold text-lg mb-4 text-slate-800">Items ({invoiceData.items?.length || 0})</Text>
                {invoiceData.items?.map((item: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-start py-4 border-b border-slate-50 last:border-0">
                        <View className="flex-1 pr-4">
                            {/* Showing Name first, fallback to description */}
                            <Text className="font-bold text-slate-800 text-base mb-1">
                                {item.name || item.description || "Item"}
                            </Text>
                            <Text className="text-slate-500 text-sm">
                                {item.quantity}  X  {invoiceData.currency}{Number(item.rate || 0).toFixed(2)}
                            </Text>
                        </View>
                        <Text className="font-bold text-slate-800 text-base">
                            {invoiceData.currency}{Number((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Totals Card */}
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-slate-600 font-medium text-base">Sub Total</Text>
                    <Text className="text-slate-800 font-bold text-base">{invoiceData.currency}{Number(invoiceData.subTotal || invoiceData.total || 0).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between pt-3 border-t border-slate-100">
                    <Text className="text-slate-800 font-bold text-xl">Total</Text>
                    <Text className="text-slate-800 font-bold text-xl">{invoiceData.currency}{Number(invoiceData.total || 0).toFixed(2)}</Text>
                </View>
            </View>

            {/* More Information (Notes) */}
            <View className="mb-8">
                <Text className="font-bold text-lg text-slate-800 mb-3 ml-1">More Information</Text>
                {invoiceData.notes ? (
                    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <RenderHtml
                            contentWidth={width - 72}
                            source={{ html: invoiceData.notes }}
                            tagsStyles={{
                                body: { color: '#334155', fontSize: 15, lineHeight: 22 },
                                p: { marginBottom: 10 }
                            }}
                        />
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
            <View className="flex-row items-center p-4 pt-12 bg-slate-100">
                <Pressable onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
                </Pressable>
                <Text className="text-2xl font-normal text-slate-800 flex-1" numberOfLines={1}>
                    Invoice
                </Text>
                <View className="flex-row">
                    <Pressable className="p-2" onPress={() => setShowEditForm(true)}>
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
                <InvoiceForm
                    initialData={invoiceData}
                    onSaveSuccess={handleSaveSuccess}
                    onCancel={() => setShowEditForm(false)}
                />
            </StandardModal>

            {/* Menu Modal */}
            <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
                <Pressable style={{ flex: 1 }} onPress={() => setShowMenu(false)}>
                    <View className="absolute right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]">
                        <Pressable
                            onPress={() => {
                                setShowMenu(false);
                                router.push({
                                    pathname: "/screens/Invoice/email",
                                    params: {
                                        invoiceId: invoiceData.id,
                                        invoiceData: JSON.stringify(invoiceData)
                                    }
                                });
                            }}
                            className="flex-row items-center justify-between px-4 py-3.5"
                        >
                            <Text className="text-base text-slate-800">Send Email</Text>
                        </Pressable>

                        <View className="h-[1px] bg-slate-100 my-1" />

                        <Pressable
                            onPress={() => {
                                setShowMenu(false);

                                const templateData = (invoiceData.templateId && typeof invoiceData.templateId === 'object') ? invoiceData.templateId : undefined;

                                router.push({
                                    pathname: "/screens/Invoice/preview",
                                    params: {
                                        invoiceId: invoiceData.id,
                                        invoiceData: JSON.stringify(invoiceData),
                                        template: templateData ? JSON.stringify(templateData) : undefined
                                    }
                                });
                            }}
                            className="flex-row items-center justify-between px-4 py-3.5"
                        >
                            <Text className="text-base text-slate-800">Preview</Text>
                        </Pressable>

                        <Pressable
                            onPress={onDownloadPress}
                            className="flex-row items-center justify-between px-4 py-3.5"
                        >
                            <Text className="text-base text-slate-800">Download PDF</Text>
                        </Pressable>

                        <View className="h-[1px] bg-slate-100 my-1" />

                        <Pressable onPress={handleDelete} className="px-4 py-3.5">
                            <Text className="text-base text-red-600">Delete</Text>
                        </Pressable>
                    </View>
                </Pressable >
            </Modal >
            <DownloadPopIn
                visible={downloadSuccess}
                fileName={downloadFileName}
                onHide={() => setDownloadSuccess(false)}
            />
        </View >
    );
};

export default InvoiceDetail;
