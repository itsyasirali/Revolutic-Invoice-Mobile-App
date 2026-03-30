import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomerForm from './CustomerForm';
import InvoiceForm from '../invoices/InvoiceForm';
import { useCustomerDetails } from '@/hooks/customers/useCustomerDetails';
import CustomerInfoTab from './CustomerInfoTab';
import CustomerInvoicesTab from './CustomerInvoicesTab';
import CustomerPaymentsTab from './CustomerPaymentsTab';
import StandardModal from '../ui/StandardModal';

const CustomerDetails: React.FC = () => {
  const {
    customerData,
    activeTab,
    setActiveTab,
    showEditForm,
    setShowEditForm,
    showNewInvoiceForm,
    setShowNewInvoiceForm,
    showMenu,
    setShowMenu,
    expandMoreInfo,
    setExpandMoreInfo,
    expandContacts,
    setExpandContacts,
    currency,
    firstContact,
    handleCall,
    handleEmail,
    handleStatusToggle,
    handleCreateInvoice,
    handleDelete,
    handleEditFormCancel,
    router,
    invoices,
    payments,
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
          {(customerData.unusedCredits || 0)} {currency}
        </Text>
      </View>
      <View className="flex-1 pr-4 border-l pl-2 border-slate-600">
        <Text className="text-slate-500 text-sm uppercase mb-1">Remaining</Text>
        <Text className="text-2xl font-bold text-slate-800">
          {(customerData.receivables || 0)} {currency}
        </Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View className="flex-row gap-x-4 bg-white border-b border-slate-200">
      {[
        { key: 'details', label: 'details' },
        { key: 'invoices', label: 'invoices' },
        { key: 'payments', label: 'payments' }
      ].map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => setActiveTab(tab.key as any)}
          className={`px-4 py-5 border-b-2 ${activeTab === tab.key ? 'border-primary' : 'border-transparent'}`}
        >
          <Text className={`font-bold text-base uppercase ${activeTab === tab.key ? 'text-primary' : 'text-slate-500'}`}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-white ">
      {/* Top Header */}
      <View className="flex-row items-center p-4 pt-12 bg-slate-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-normal text-slate-800 flex-1">{customerData.displayName}</Text>
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

      {renderTabs()}

      {activeTab === 'details' && (
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

      {activeTab === 'invoices' && (
        <CustomerInvoicesTab
          invoices={invoices}
          currency={currency}
          router={router}
        />
      )}

      {activeTab === 'payments' && (
        <CustomerPaymentsTab
          payments={payments}
          currency={currency}
          customerData={customerData}
          router={router}
        />
      )}

      {/* Modals */}
      <StandardModal visible={showEditForm} onClose={handleEditFormCancel}>
        <CustomerForm
          customer={customerData}
          onCancel={handleEditFormCancel}
        />
      </StandardModal>

      <StandardModal visible={showNewInvoiceForm} onClose={() => setShowNewInvoiceForm(false)}>
        <InvoiceForm
          initialData={{ customerId: customerData }}
          onSaveSuccess={handleCreateInvoice}
          onCancel={() => setShowNewInvoiceForm(false)}
        />
      </StandardModal>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }} onPress={() => setShowMenu(false)}>
          <View className="absolute right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]">
            <Pressable onPress={() => { setShowMenu(false); setShowNewInvoiceForm(true); }} className="flex-row items-center justify-between px-4 py-3.5 hover:bg-slate-50">
              <Text className="text-base text-slate-800">New Transaction</Text>
              <MaterialIcons name="arrow-right" size={24} color="#64748b" />
            </Pressable>

            <Pressable onPress={() => { setShowMenu(false); handleEmail(firstContact?.email); }} className="px-4 py-3.5">
              <Text className="text-base text-slate-800">Email</Text>
            </Pressable>

            <View className="h-[1px] bg-slate-100 my-1" />

            <Pressable onPress={handleStatusToggle} className="px-4 py-3.5">
              <Text className="text-base text-slate-800">{customerData.status === 'Active' ? 'Mark as Inactive' : 'Mark as Active'}</Text>
            </Pressable>

            <Pressable onPress={handleDelete} className="px-4 py-3.5">
              <Text className="text-base text-slate-800">Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CustomerDetails;
