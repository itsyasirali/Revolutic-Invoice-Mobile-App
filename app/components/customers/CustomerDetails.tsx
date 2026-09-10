import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomerForm from "./CustomerForm";
import InvoiceForm from "../invoices/InvoiceForm";
import useCustomerDetails from "@/hooks/customers/useCustomerDetails";
import CustomerInfoTab from "./CustomerInfoTab";
import CustomerInvoicesTab from "./CustomerInvoicesTab";
import CustomerPaymentsTab from "./CustomerPaymentsTab";
import StandardModal from "../ui/StandardModal";
import DetailPageHeader from "../ui/DetailPageHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomerDetails: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    customerData,
    activeTab,
    setActiveTab,
    showEditForm,
    showNewInvoiceForm,
    showMenu,
    expandMoreInfo,
    expandContacts,
    setExpandMoreInfo,
    setExpandContacts,
    currency,
    firstContact,
    invoices,
    payments,
    deleteLoading,
    handleCall,
    handleEmail,
    handleStatusToggle,
    handleCreateInvoice,
    handleEditFormCancel,
    handleDelete,
    handleOpenEdit,
    handleCloseEdit,
    handleOpenNewInvoice,
    handleCloseNewInvoice,
    handleOpenMenu,
    handleCloseMenu,
    handleNavigateBack,
    toggleExpandMoreInfo,
    toggleExpandContacts,
    router,
  } = useCustomerDetails();


  if (!customerData) {
    return (
      <View className="flex-1 p-4 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">Loading...</Text>
      </View>
    );
  }

  const renderHeaderStats = () => (
    <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
      <View className="flex-1 pl-4">
        <Text className="text-slate-500 text-sm uppercase mb-1">Received</Text>
        <Text className="text-2xl font-bold text-slate-800">
          {customerData.unusedCredits || 0} {currency}
        </Text>
      </View>
      <View className="flex-1 pr-4 border-l pl-2 border-slate-600">
        <Text className="text-slate-500 text-sm uppercase mb-1">Remaining</Text>
        <Text className="text-2xl font-bold text-slate-800">
          {customerData.receivables || 0} {currency}
        </Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View className="flex-row gap-x-4 bg-white border-b border-slate-200">
      {[
        { key: "details", label: "details" },
        { key: "invoices", label: "invoices" },
        { key: "payments", label: "payments" },
      ].map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => setActiveTab(tab.key as any)}
          className={`px-4 py-5 border-b-2 ${activeTab === tab.key ? "border-primary" : "border-transparent"}`}
        >
          <Text
            className={`font-bold text-base uppercase ${activeTab === tab.key ? "text-primary" : "text-slate-500"}`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-white ">
      {/* Top Header */}
      <DetailPageHeader
        title={customerData.displayName}
        onBack={handleNavigateBack}
        onEdit={handleOpenEdit}
        onMenu={handleOpenMenu}
      />


      {renderHeaderStats()}

      {renderTabs()}

      {activeTab === "details" && (
        <CustomerInfoTab
          customerData={customerData}
          currency={currency}
          firstContact={firstContact}
          expandMoreInfo={expandMoreInfo}
          setExpandMoreInfo={setExpandMoreInfo}
          expandContacts={expandContacts}
          setExpandContacts={setExpandContacts}
          handleCall={handleCall}
          handleEmail={handleEmail}
        />
      )}

      {activeTab === "invoices" && (
        <CustomerInvoicesTab
          invoices={invoices}
          currency={currency}
          router={router}
        />
      )}

      {activeTab === "payments" && (
        <CustomerPaymentsTab
          payments={payments}
          currency={currency}
          customerData={customerData}
          router={router}
        />
      )}

      {/* Modals */}
      <StandardModal visible={showEditForm} onClose={handleEditFormCancel}>
        <CustomerForm customer={customerData} onCancel={handleEditFormCancel} />
      </StandardModal>

      <StandardModal
        visible={showNewInvoiceForm}
        onClose={handleCloseNewInvoice}
      >
        <InvoiceForm
          initialData={{ customerId: customerData }}
          onSaveSuccess={handleCreateInvoice}
          onCancel={handleCloseNewInvoice}
        />
      </StandardModal>

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
              onPress={handleOpenNewInvoice}
              className="flex-row items-center justify-between px-4 py-3.5 hover:bg-slate-50"
            >
              <Text className="text-base text-slate-800">New Transaction</Text>
              <MaterialIcons name="arrow-right" size={24} color="#64748b" />
            </Pressable>

            <Pressable
              onPress={() => {
                handleCloseMenu();
                handleEmail(firstContact?.email);
              }}
              className="px-4 py-3.5"
            >
              <Text className="text-base text-slate-800">Email</Text>
            </Pressable>


            <View className="h-[1px] bg-slate-100 my-1" />

            <Pressable onPress={handleStatusToggle} className="px-4 py-3.5">
              <Text className="text-base text-slate-800">
                {customerData.status === "Active"
                  ? "Mark as Inactive"
                  : "Mark as Active"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text
                className={`text-base ${deleteLoading ? "text-red-300" : "text-red-600"}`}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Text>
              {deleteLoading && (
                <ActivityIndicator size="small" color="#dc2626" />
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CustomerDetails;
