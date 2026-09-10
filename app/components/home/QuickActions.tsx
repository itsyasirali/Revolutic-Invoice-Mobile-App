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

  const actions: {
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    bgColor: string;
    onPress: () => void;
  }[] = [
    {
      key: "customer",
      label: "New\nCustomer",
      icon: "person",
      iconColor: "#10b981",
      bgColor: "#ecfdf5",
      onPress: handleOpenCustomer,
    },
    {
      key: "item",
      label: "New\nItem",
      icon: "cube",
      iconColor: "#d97706",
      bgColor: "#fef3c7",
      onPress: handleOpenItem,
    },
    {
      key: "invoice",
      label: "New\nInvoice",
      icon: "document-text",
      iconColor: "#1AA3FF",
      bgColor: "#eef2ff",
      onPress: handleOpenInvoice,
    },
    {
      key: "payment",
      label: "New\nPayment",
      icon: "card",
      iconColor: "#f43f5e",
      bgColor: "#fff1f2",
      onPress: handleOpenPayment,
    },
  ];

  return (
    <>
      <View className="bg-white rounded-[24px] py-5 px-3 border border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={action.onPress}
              className="items-center justify-center active:opacity-80 flex-1 px-0.5 py-1"
            >
              <View className="relative items-center justify-center">
                <View
                  style={{ backgroundColor: action.bgColor }}
                  className="w-14 h-14 rounded-full items-center justify-center"
                >
                  <Ionicons
                    name={action.icon}
                    size={25}
                    color={action.iconColor}
                  />
                </View>
                <View className="w-[18px] h-[18px] rounded-full bg-slate-900 absolute bottom-0 right-0 items-center justify-center border-2 border-white shadow-xs">
                  <Ionicons name="add" size={10} color="white" />
                </View>
              </View>
              <Text
                numberOfLines={2}
                className="text-slate-800 font-semibold text-[12px] leading-[16px] text-center mt-2.5"
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Customer Form Modal */}
      <StandardModal
        visible={activeModal === "customer"}
        onClose={handleCloseModal}
      >
        <CustomerForm customer={null} onCancel={handleCloseModal} />
      </StandardModal>

      {/* Item Form Modal */}
      <StandardModal
        visible={activeModal === "item"}
        onClose={handleCloseModal}
      >
        <ItemForm item={null} onCancel={handleCloseModal} />
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
