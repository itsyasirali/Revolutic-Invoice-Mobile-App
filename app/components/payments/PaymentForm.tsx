import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import usePaymentForm from '@/hooks/payments/usePaymentForm';
import InputField from '../ui/InputField';
import StandardButton from '../ui/StandardButton';
import SearchableDropdown from '../ui/SearchableDropdown';

interface PaymentFormProps {
  payment?: any;
  onSave: (data: any) => Promise<any>;
  onCancel: () => void;
  loading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onSave, onCancel, loading }) => {
  const {
    isEditMode,
    paymentData,
    filteredCustomers,
    selectCustomer,
    clearCustomer,
    payAllRemaining,
    handlePayAllRemainingToggle,
    isSubmitting,
    isSaving,
    unpaidInvoices,
    appliedAmounts,
    handleAppliedAmountChange,
    handlePayInFull,
    templates,
    handleInputChange,
    submitPayment,
    previewPayment,
  } = usePaymentForm(payment);

  const customerOptions = useMemo(() => {
    return filteredCustomers.map((c: any) => ({
      label: c.displayName || c.companyName || 'Unknown Customer',
      value: c.id,
      sublabel: [c.companyName, c.email].filter(Boolean).join(' • ') || undefined,
    }));
  }, [filteredCustomers]);

  const templateOptions = useMemo(() => {
    return templates.map((t: any) => ({
      label: t.name || 'Unnamed Template',
      value: t.id,
    }));
  }, [templates]);

  const onSubmit = () => submitPayment(onSave, onCancel);
  const onPreview = () => previewPayment(onSave, onCancel);

  const isLoading = loading || isSubmitting || isSaving;

  const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Other'];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-4 py-5 flex-row justify-between items-center z-10">
        <Pressable onPress={onCancel}>
          <Text className="text-primary font-semibold">Cancel</Text>
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">
          {isEditMode ? 'Edit Payment' : 'Record Payment'}
        </Text>
        <Pressable style={{ opacity: paymentData.customerId ? 1 : 0.3 }} onPress={() => onSubmit()} disabled={isLoading || !paymentData.customerId}>
          {isLoading ? <ActivityIndicator size="small" color="#1AA3FF" /> : <Text className="text-primary font-bold">Save</Text>}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 p-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >

        {/* 1. Customer Selection */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <SearchableDropdown
            label="Customer *"
            placeholder="Select Customer..."
            searchPlaceholder="Search customers by name, company, email..."
            value={paymentData.customerId}
            options={customerOptions}
            onSelect={(opt) => {
              const selected = filteredCustomers.find((c: any) => c.id === opt.value);
              if (selected) selectCustomer(selected);
            }}
            clearable
            onClear={clearCustomer}
            leftIcon={<Ionicons name="person-outline" size={18} color="#1AA3FF" />}
            containerStyle="mb-0"
          />
        </View>

        <View pointerEvents={paymentData.customerId ? 'auto' : 'none'}>

          {/* 2. Payment Details */}
          <View style={{ opacity: paymentData.customerId ? 1 : 0.3 }} className="bg-white p-4 rounded-xl mb-4 shadow-sm">
            <Text className="font-bold text-base mb-3 text-slate-800">Payment Details</Text>

            <InputField
              label="Amount Received *"
              value={paymentData.amount?.toString() || ''}
              onChangeText={(t) => handleInputChange('amount', t)}
              placeholder="0.00"
              keyboardType="numeric"
              containerStyle="mb-3"
              inputStyle="text-lg font-semibold flex-1 text-slate-800"
              error={!paymentData.amount ? "Required" : undefined}
            />

            {unpaidInvoices.length > 0 && (
              <Pressable
                onPress={handlePayAllRemainingToggle}
                className="flex-row items-center mb-4"
              >
                <MaterialIcons
                  name={payAllRemaining ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color="#1AA3FF"
                />
                <Text className="ml-2 text-slate-700 font-medium">Receive full amount ({unpaidInvoices.reduce((sum, inv) => sum + Number(inv.remaining || 0), 0).toFixed(2)})</Text>
              </Pressable>
            )}

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <InputField
                  label="Bank Charges"
                  value={paymentData.bankCharges?.toString() || ''}
                  onChangeText={(t) => handleInputChange('bankCharges', t)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <InputField
                  label="Date *"
                  value={paymentData.paymentDate}
                  onChangeText={(t) => handleInputChange('paymentDate', t)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label="Reference"
                  value={paymentData.reference}
                  onChangeText={(t) => handleInputChange('reference', t)}
                  placeholder="Ex. 123456"
                />
              </View>
            </View>

            <Text className="text-sm text-slate-500 mb-2">Payment Mode</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row pb-2">
                {paymentMethods.map((method) => (
                  <Pressable
                    key={method}
                    onPress={() => handleInputChange('paymentMethod', method)}
                    className={`px-4 py-2 rounded-md mr-2 border ${paymentData.paymentMethod === method
                      ? 'bg-primary border-primary'
                      : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <Text className={`font-semibold ${paymentData.paymentMethod === method ? 'text-white' : 'text-slate-600'
                      }`}>
                      {method}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 3. Unpaid Invoices */}
          {unpaidInvoices.length > 0 && (
            <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
              <Text className="font-bold text-base mb-3 text-slate-800">Unpaid Invoices</Text>
              {unpaidInvoices.map((invoice) => (
                <View key={invoice.id} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <View className="flex-row justify-between mb-1">
                    <Text className="font-semibold text-slate-700">{invoice.invoiceNumber}</Text>
                    <Text className="text-slate-500 text-xs">{new Date(invoice.dueDate).toLocaleDateString()}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-slate-500 text-sm">Total: {invoice.total}</Text>
                    <Text className="font-semibold text-red-500 text-sm">Due: {invoice.remaining}</Text>
                  </View>
                  <View className="flex-row items-center pt-2">
                    <InputField
                      value={appliedAmounts[invoice.id]?.toString() || ''}
                      onChangeText={(t) => handleAppliedAmountChange(invoice.id, t)}
                      placeholder="0.00"
                      keyboardType="numeric"
                      containerStyle="flex-1 mb-0"
                      inputStyle="text-right text-sm py-1"
                    />
                    <Pressable onPress={() => handlePayInFull(invoice.id, invoice.remaining)} className="ml-3">
                      <Text className="text-primary font-bold text-xs uppercase">Pay Full</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 4. Notes */}
          <View style={{ opacity: paymentData.customerId ? 1 : 0.3 }} className="bg-white p-4 rounded-xl mb-4 shadow-sm">
            <Text className="font-bold text-base mb-3 text-slate-800">Additional Notes</Text>
            <InputField
              value={paymentData.description}
              onChangeText={(t) => handleInputChange('description', t)}
              placeholder="Description"
              multiline
              numberOfLines={2}
              containerStyle="mb-3"
              inputStyle="min-h-[100px] flex-1 text-slate-800 text-base"
              textAlignVertical="top"
            />
            <InputField
              value={paymentData.notes}
              onChangeText={(t) => handleInputChange('notes', t)}
              placeholder="Notes"
              multiline
              numberOfLines={3}
              containerStyle="mb-0"
              inputStyle="min-h-[100px] flex-1 text-slate-800 text-base"
              textAlignVertical="top"
            />
          </View>

          {/* 5. Template */}
          <View style={{ opacity: paymentData.customerId ? 1 : 0.3 }} className="bg-white p-4 rounded-xl mb-4 shadow-sm">
            <SearchableDropdown
              label="Template"
              placeholder="Select Template..."
              searchPlaceholder="Search templates..."
              value={paymentData.templateId}
              options={templateOptions}
              onSelect={(opt) => handleInputChange('templateId', String(opt.value))}
              leftIcon={<Ionicons name="document-text-outline" size={18} color="#1AA3FF" />}
              containerStyle="mb-0"
            />
          </View>


          {/* 6. Preview Button (Bottom) */}
          <StandardButton
            title="Preview Payment"
            onPress={onPreview}
            disabled={isSubmitting || isSaving}
            className={`mb-12 ${paymentData.customerId ? 'opacity-100' : 'opacity-30'}`}
            variant="primary"
          />
        </View>

      </ScrollView >
    </View >
  );
};

export default PaymentForm;
