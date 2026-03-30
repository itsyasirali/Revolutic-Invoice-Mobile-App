import { View, Text, Pressable, ActivityIndicator, SafeAreaView } from "react-native";
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import usePaymentPreview from "@/hooks/payments/usePaymentPreview";

const PaymentPreview = () => {
    const {
        payment: displayPayment,
        loading: fetching,
        generateHTML,
        handleGeneratePDF,
        handleEdit,
        handleSendEmailContext,
        handleSave,
        isDraft,
        goBack
    } = usePaymentPreview();

    if (fetching && !displayPayment) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0891B2" />
            </View>
        );
    }

    if (!displayPayment) {
        return (
            <View className="flex-1 justify-center items-center bg-white p-4">
                <Text className="text-red-500 text-lg">Payment not found.</Text>
                <Pressable onPress={goBack} className="mt-4 bg-gray-200 p-3 rounded-lg">
                    <Text>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 pt-8 border-b border-slate-200 flex-row justify-between items-center shadow-sm z-10">
                <Pressable onPress={goBack}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text className="font-bold text-lg text-slate-800">Payment Preview</Text>
                {isDraft ? (
                    <Pressable onPress={() => handleSave()}>
                        <Text className="text-primary font-bold">Save</Text>
                    </Pressable>
                ) : (
                    <Pressable onPress={handleEdit} disabled={isDraft}>
                        <Text className="text-primary font-bold">Edit</Text>
                    </Pressable>
                )}
            </View>

            <View className="flex-1 bg-slate-50 relative">
                <WebView
                    originWhitelist={['*']}
                    source={{ html: generateHTML() }}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    scalesPageToFit={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>

            {/* Footer Actions */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg flex-row gap-3">
                <Pressable
                    onPress={handleGeneratePDF}
                    className="flex-1 bg-white border border-slate-300 py-3 rounded-xl items-center flex-row justify-center"
                >
                    <Ionicons name="share-outline" size={20} color="#334155" />
                    <Text className="font-bold text-slate-700 ml-2">PDF</Text>
                </Pressable>

                <Pressable
                    onPress={handleSendEmailContext}
                    className="flex-[2] py-3 rounded-xl items-center flex-row justify-center bg-primary"
                >
                    <Ionicons name="mail" size={20} color="white" />
                    <Text className="font-bold text-white ml-2">Send Receipt</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default PaymentPreview;
