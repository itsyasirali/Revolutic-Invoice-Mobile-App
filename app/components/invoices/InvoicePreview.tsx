import React from "react";
import { View, Text, Pressable, ActivityIndicator, SafeAreaView } from "react-native";
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { generateInvoiceHTML } from "@/utils/generateInvoiceHTML";
import { useInvoicePreview } from "@/hooks/invoices/useInvoicePreview";
import DownloadPopIn from "../ui/DownloadPopIn";

const PreviewScreen = () => {
  const {
    displayInvoice,
    template,
    fetching,
    isSaving,
    handleGeneratePDF,
    handleSendEmail,
    handleSaveDraft,
    router,
    downloadSuccess,
    setDownloadSuccess,
    downloadFileName
  } = useInvoicePreview();

  if (fetching && !displayInvoice) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1AA3FF" />
      </View>
    );
  }

  if (!displayInvoice) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg">Invoice not found or failed to load.</Text>
        < Pressable onPress={() => router.back()} className="mt-4 bg-gray-200 p-3 rounded-lg">
          <Text>Go Back</Text>
        </ Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 pt-12 border-b border-slate-200 flex-row justify-between items-center shadow-sm z-10">
        < Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </ Pressable>
        <Text className="font-bold text-lg text-slate-800">Preview</Text>
        < Pressable onPress={handleSaveDraft} disabled={isSaving}>
          <Text className="text-primary font-bold">{isSaving ? 'Saving...' : 'Save'}</Text>
        </ Pressable>
      </View>

      <View className="flex-1 bg-slate-50 relative pb-24">
        {/* Alert Banner */}


        <View className="flex-1">
          <WebView
            originWhitelist={['*']}
            source={{ html: generateInvoiceHTML(displayInvoice, template) }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      </View>

      {/* Footer Actions */}
      <View className="absolute mb-2 bottom-0 left-0 right-0 p-4 flex-row gap-3">
        < Pressable
          onPress={handleGeneratePDF}
          className="flex-1 bg-white border border-slate-300 py-3 rounded-xl items-center flex-row justify-center"
        >
          <Ionicons name="share-outline" size={20} color="#334155" />
          <Text className="font-bold text-slate-700 ml-2">PDF</Text>
        </ Pressable>

        < Pressable
          onPress={handleSendEmail}
          disabled={isSaving}
          className={`flex-[2] py-3 rounded-xl items-center flex-row justify-center bg-primary`}
        >
          {isSaving ? <ActivityIndicator color="white" /> : <Ionicons name="mail" size={20} color="white" />}
          <Text className="font-bold text-white ml-2">{isSaving ? "Saving..." : "Send Invoice"}</Text>
        </ Pressable>
      </View>
      <DownloadPopIn
        visible={downloadSuccess}
        fileName={downloadFileName}
        onHide={() => setDownloadSuccess(false)}
      />
    </SafeAreaView>
  );
};

export default PreviewScreen;
