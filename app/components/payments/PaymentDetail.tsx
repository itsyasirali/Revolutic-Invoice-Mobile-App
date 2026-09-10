import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import usePaymentDetails from "@/hooks/payments/usePaymentDetails";
import PaymentForm from "./PaymentForm";
import StandardModal from "../ui/StandardModal";
import DetailPageHeader from "../ui/DetailPageHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PaymentDetail: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    paymentData,
    loading,
    showEditForm,
    showMenu,
    statusStyle,
    customerDisplayName,
    customerInitial,
    customerEmail,
    formattedAmount,
    formattedPaymentDate,
    handleOpenEdit,
    handleCloseEdit,
    handleOpenMenu,
    handleCloseMenu,
    handleSaveSuccess,
    handleDelete,
    handleDownloadReceipt,
    handlePreview,
    handleSendEmail,
    goBack,
  } = usePaymentDetails();

  if (!paymentData) {
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
        title="Payment"
        onBack={goBack}
        onEdit={handleOpenEdit}
        onMenu={handleOpenMenu}
      />

      {/* Header stats section */}
      <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
        <View className="flex-1 pl-4">
          <Text className="text-slate-500 text-sm uppercase mb-1">
            Amount Received
          </Text>
          <Text className="text-2xl font-bold text-slate-800">
            {paymentData.currency} {formattedAmount}
          </Text>
        </View>
        <View className="flex-1 pr-4 border-l pl-4 border-slate-400">
          <Text className="text-slate-500 text-sm uppercase mb-1">
            Payment Date
          </Text>
          <Text className="text-xl font-bold text-slate-700">
            {formattedPaymentDate}
          </Text>
        </View>
      </View>

      {/* Details content */}
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
                Payment Date:{" "}
                <Text className="font-bold text-slate-800">
                  {formattedPaymentDate}
                </Text>
              </Text>
              <Text className="text-slate-400 text-xs">
                Ref: {paymentData.reference || "N/A"}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-bl-xl rounded-tr-xl ${statusStyle.bg}`}
            >
              <Text
                className={`text-xs font-bold uppercase ${statusStyle.text} tracking-wider`}
              >
                {paymentData.paymentMode}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-slate-400 text-xs mb-1 font-medium">
                Payment#
              </Text>
              <Text className="text-slate-800 font-bold text-lg">
                {paymentData.paymentNumber || `#${paymentData.id.slice(-6)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Applied Invoices List */}
        {paymentData.appliedInvoices &&
          paymentData.appliedInvoices.length > 0 && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
              <Text className="font-bold text-lg mb-4 text-slate-800">
                Applied Invoices ({paymentData.appliedInvoices.length})
              </Text>
              {paymentData.appliedInvoices.map((item: any, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-start py-4 border-b border-slate-50 last:border-0"
                >
                  <View className="flex-1 pr-4">
                    <Text className="font-bold text-slate-800 text-base mb-1">
                      {item.invoice?.invoiceNumber ||
                        item.invoiceNumber ||
                        "Unknown Invoice"}
                    </Text>
                    <Text className="text-slate-500 text-sm">
                      Total Invoice: {paymentData.currency}{" "}
                      {Number(
                        item.invoice?.total || item.invoiceAmount || 0,
                      ).toFixed(2)}
                    </Text>
                  </View>
                  <Text className="font-bold text-slate-800 text-base">
                    {paymentData.currency}
                    {Number(item.amount || 0).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

        {/* Totals Card */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
          <View className="flex-row justify-between pt-1">
            <Text className="text-slate-800 font-bold text-xl">
              Amount Received
            </Text>
            <Text className="text-slate-800 font-bold text-xl">
              {paymentData.currency} {formattedAmount}
            </Text>
          </View>
        </View>

        {/* More Information (Notes) */}
        <View className="mb-8">
          <Text className="font-bold text-lg text-slate-800 mb-3 ml-1">
            More Information
          </Text>
          {paymentData.notes ? (
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <Text className="text-slate-700 text-base leading-6">
                {paymentData.notes}
              </Text>
            </View>
          ) : (
            <Text className="text-slate-400 italic ml-1">
              No additional notes.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <StandardModal
        visible={showEditForm}
        onClose={handleCloseEdit}
      >
        <PaymentForm
          payment={paymentData}
          onSave={handleSaveSuccess}
          onCancel={handleCloseEdit}
          loading={loading}
        />
      </StandardModal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}
          onPress={handleCloseMenu}
        >
          <View
            className="absolute right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]"
            style={{ top: insets.top + 8 }}
          >
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
