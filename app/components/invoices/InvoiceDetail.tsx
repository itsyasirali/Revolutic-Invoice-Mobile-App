import React from "react";
import RenderHtml from "react-native-render-html";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import InvoiceForm from "./InvoiceForm";
import useInvoiceDetails from "@/hooks/invoices/useInvoiceDetails";
import StandardModal from "../ui/StandardModal";
import DownloadPopIn from "../ui/DownloadPopIn";
import DetailPageHeader from "../ui/DetailPageHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const InvoiceDetail: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    invoiceData,
    showEditForm,
    showMenu,
    statusStyle,
    customerDisplayName,
    customerInitial,
    customerEmail,
    handleSaveSuccess,
    handleDelete,
    onDownloadPress,
    downloadSuccess,
    downloadFileName,
    handleOpenEdit,
    handleCloseEdit,
    handleOpenMenu,
    handleCloseMenu,
    handleHideDownloadPopIn,
    handleNavigateBack,
    handleOpenEmail,
    handleOpenPreview,
    width,
  } = useInvoiceDetails();

  if (!invoiceData) {
    return (
      <View className="flex-1 p-4 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#1AA3FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Top Header */}
      <DetailPageHeader
        title="Invoice"
        onBack={handleNavigateBack}
        onEdit={handleOpenEdit}
        onMenu={handleOpenMenu}
      />

      {/* Header Stats */}
      <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
        <View className="flex-1 pl-4">
          <Text className="text-slate-500 text-sm uppercase mb-1">
            Total Amount
          </Text>
          <Text className="text-2xl font-bold text-slate-800">
            {invoiceData.currency} {Number(invoiceData.total || 0).toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 pr-4 border-l pl-4 border-slate-400">
          <Text className="text-slate-500 text-sm uppercase mb-1">
            Balance Due
          </Text>
          <Text className="text-2xl font-bold text-red-600">
            {invoiceData.currency}{" "}
            {Number(invoiceData.remaining || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Details Tab Content */}
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Customer Profile Card */}
        <View className="bg-white rounded-2xl mb-4 border border-primary/20 p-5">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-xl font-black text-primary">
                {customerInitial}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                {customerDisplayName}
              </Text>
              {customerEmail ? (
                <Text className="text-sm text-slate-600 font-medium">
                  {customerEmail}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Metadata Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-slate-500 text-sm mb-1">
                Due on:{" "}
                <Text className="font-bold text-slate-800">
                  {new Date(invoiceData.dueDate).toLocaleDateString()}
                </Text>
              </Text>
              <Text className="text-slate-400 text-xs">
                Terms: Due on Receipt
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-bl-xl rounded-tr-xl ${statusStyle.bg}`}
            >
              <Text
                className={`text-xs font-bold uppercase ${statusStyle.text} tracking-wider`}
              >
                {invoiceData.status}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-slate-400 text-xs mb-1 font-medium">
                Invoice#
              </Text>
              <Text className="text-slate-800 font-bold text-lg">
                {invoiceData.invoiceNumber}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs mb-1 font-medium">
                Invoice Date
              </Text>
              <Text className="text-slate-800 font-bold text-lg">
                {new Date(invoiceData.invoiceDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
          <Text className="font-bold text-lg mb-4 text-slate-800">
            Items ({invoiceData.items?.length || 0})
          </Text>
          {invoiceData.items?.map((item: any, index: number) => (
            <View
              key={index}
              className="flex-row justify-between items-start py-4 border-b border-slate-50 last:border-0"
            >
              <View className="flex-1 pr-4">
                <Text className="font-bold text-slate-800 text-base mb-1">
                  {item.name || item.description || "Item"}
                </Text>
                <Text className="text-slate-500 text-sm">
                  {item.quantity} X {invoiceData.currency}
                  {Number(item.rate || 0).toFixed(2)}
                </Text>
              </View>
              <Text className="font-bold text-slate-800 text-base">
                {invoiceData.currency}
                {Number((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Card */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-600 font-medium text-base">
              Sub Total
            </Text>
            <Text className="text-slate-800 font-bold text-base">
              {invoiceData.currency}
              {Number(invoiceData.subTotal || invoiceData.total || 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between pt-3 border-t border-slate-100">
            <Text className="text-slate-800 font-bold text-xl">Total</Text>
            <Text className="text-slate-800 font-bold text-xl">
              {invoiceData.currency}
              {Number(invoiceData.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* More Information (Notes) */}
        <View className="mb-8">
          <Text className="font-bold text-lg text-slate-800 mb-3 ml-1">
            More Information
          </Text>
          {invoiceData.notes ? (
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <RenderHtml
                contentWidth={width - 72}
                source={{ html: invoiceData.notes }}
                tagsStyles={{
                  body: { color: "#334155", fontSize: 15, lineHeight: 22 },
                  p: { marginBottom: 10 },
                }}
              />
            </View>
          ) : (
            <Text className="text-slate-400 italic ml-1">
              No additional notes.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <StandardModal visible={showEditForm} onClose={handleCloseEdit}>
        <InvoiceForm
          initialData={invoiceData}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCloseEdit}
        />
      </StandardModal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <Pressable style={{ flex: 1 }} onPress={handleCloseMenu}>
          <View
            className="absolute right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]"
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              onPress={handleOpenEmail}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <Text className="text-base text-slate-800">Send Email</Text>
            </Pressable>

            <View className="h-[1px] bg-slate-100 my-1" />

            <Pressable
              onPress={handleOpenPreview}
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
        </Pressable>
      </Modal>

      <DownloadPopIn
        visible={downloadSuccess}
        fileName={downloadFileName}
        onHide={handleHideDownloadPopIn}
      />
    </View>
  );
};

export default InvoiceDetail;

