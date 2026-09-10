import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useQuickActions from "@/hooks/dashboard/useQuickActions";
import StandardModal from "../ui/StandardModal";
import CustomerForm from "../customers/CustomerForm";
import ItemForm from "../items/ItemForm";
import InvoiceForm from "../invoices/InvoiceForm";
import PaymentForm from "../payments/PaymentForm";

interface QuickActionsProps {
  onCreateInvoice?: () => void;
  onAddCustomer?: () => void;
  onAddItem?: () => void;
  onRecordPayment?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = (props) => {
  const {
    activeModal,
    formLoading,
    handleOpenCustomer,
    handleOpenItem,
    handleOpenInvoice,
    handleOpenPayment,
    handleCloseModal,
    handleSavePayment,
    handleInvoiceSuccess,
  } = useQuickActions(props);

  return (
    <>
      <View className="bg-white rounded-[22px] p-3.5 border border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          {/* 1. New Customer */}
          <Pressable
            onPress={handleOpenCustomer}
            className="items-center active:opacity-80 flex-1 px-1"
          >
            <View className="relative items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-[#ecfdf5] items-center justify-center">
                <Ionicons name="person" size={22} color="#10b981" />
              </View>
              <View className="w-4 h-4 rounded-full bg-slate-900 absolute bottom-0 right-0 items-center justify-center border border-white">
                <Ionicons name="add" size={9} color="white" />
              </View>
            </View>
            <Text
              numberOfLines={2}
              className="text-slate-800 font-bold text-[11px] leading-[14px] text-center mt-1.5"
            >
              New{"\n"}Customer
            </Text>
          </Pressable>

          {/* 2. New Item */}
          <Pressable
            onPress={handleOpenItem}
            className="items-center active:opacity-80 flex-1 px-1"
          >
            <View className="relative items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-[#fef3c7] items-center justify-center">
                <Ionicons name="cube" size={22} color="#d97706" />
              </View>
              <View className="w-4 h-4 rounded-full bg-slate-900 absolute bottom-0 right-0 items-center justify-center border border-white">
                <Ionicons name="add" size={9} color="white" />
              </View>
            </View>
            <Text
              numberOfLines={2}
              className="text-slate-800 font-bold text-[11px] leading-[14px] text-center mt-1.5"
            >
              New{"\n"}Item
            </Text>
          </Pressable>

          {/* 3. New Invoice */}
          <Pressable
            onPress={handleOpenInvoice}
            className="items-center active:opacity-80 flex-1 px-1"
          >
            <View className="relative items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-[#eef2ff] items-center justify-center">
                <Ionicons name="document-text" size={22} color="#1AA3FF" />
              </View>
              <View className="w-4 h-4 rounded-full bg-slate-900 absolute bottom-0 right-0 items-center justify-center border border-white">
                <Ionicons name="add" size={9} color="white" />
              </View>
            </View>
            <Text
              numberOfLines={2}
              className="text-slate-800 font-bold text-[11px] leading-[14px] text-center mt-1.5"
            >
              New{"\n"}Invoice
            </Text>
          </Pressable>

          {/* 4. New Payment */}
          <Pressable
            onPress={handleOpenPayment}
            className="items-center active:opacity-80 flex-1 px-1"
          >
            <View className="relative items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-[#fff1f2] items-center justify-center">
                <Ionicons name="card" size={22} color="#f43f5e" />
              </View>
              <View className="w-4 h-4 rounded-full bg-slate-900 absolute bottom-0 right-0 items-center justify-center border border-white">
                <Ionicons name="add" size={9} color="white" />
              </View>
            </View>
            <Text
              numberOfLines={2}
              className="text-slate-800 font-bold text-[11px] leading-[14px] text-center mt-1.5"
            >
              New{"\n"}Payment
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Customer Form Modal */}
      <StandardModal
        visible={activeModal === "customer"}
        onClose={handleCloseModal}
      >
        <CustomerForm
          customer={null}
          onCancel={handleCloseModal}
        />
      </StandardModal>

      {/* Item Form Modal */}
      <StandardModal
        visible={activeModal === "item"}
        onClose={handleCloseModal}
      >
        <ItemForm
          item={null}
          onCancel={handleCloseModal}
        />
      </StandardModal>

      {/* Invoice Form Modal */}
      <StandardModal
        visible={activeModal === "invoice"}
        onClose={handleCloseModal}
      >
        <InvoiceForm
          onCancel={handleCloseModal}
          onSaveSuccess={handleInvoiceSuccess}
        />
      </StandardModal>

      {/* Payment Form Modal */}
      <StandardModal
        visible={activeModal === "payment"}
        onClose={handleCloseModal}
      >
        <PaymentForm
          onCancel={handleCloseModal}
          onSave={handleSavePayment}
          loading={formLoading}
        />
      </StandardModal>
    </>
  );
};

export default QuickActions;
