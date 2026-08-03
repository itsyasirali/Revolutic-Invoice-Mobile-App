import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useInvoiceForm } from '@/hooks/invoices/useInvoiceForm';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../ui/InputField';
import { useCustomerList } from '@/hooks/customers/useCustomerList';
import { useItemList } from '@/hooks/items/useItemList';
import useTemplatesList from '@/hooks/templates/useTemplatesList';
import { InvoiceFormProps } from '@/types/invoice';

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const router = useRouter();

  const {
    invoiceNumber, setInvoiceNumber,
    invoiceDate, setInvoiceDate,
    dueDate, setDueDate,
    customer, setCustomer,
    templateId, setTemplateId,
    discountPercent, setDiscountPercent,
    notes, setNotes,
    items, setItems,
    previousDue,
    loading,
    handleSubmit,
    calculateSubTotal,
    calculateTotalAmount,
    preparePayload,
    handleItemSelect,
    handleItemChange,
    addItemRow
  } = useInvoiceForm(initialData, onSaveSuccess);

  const { customers } = useCustomerList();
  const { items: itemOptions } = useItemList();
  const { templates } = useTemplatesList();

  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || new Date();
    if (showInvoiceDatePicker) {
      setInvoiceDate(currentDate.toISOString().slice(0, 10));
      setShowInvoiceDatePicker(false);
    } else if (showDueDatePicker) {
      setDueDate(currentDate.toISOString().slice(0, 10));
      setShowDueDatePicker(false);
    }
  };




  const handlePreview = () => {
    if (!customer) {
      Alert.alert("Validation Error", "Please select a customer before previewing the invoice.");
      return;
    }
    try {
      const payload = preparePayload();
      const previewData = {
        ...payload,
        id: initialData?.id || 'preview',
        customerId: customer, // Pass full object for preview to access contacts
        customerName: customer?.displayName,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
        customerCurrency: customer?.currency,
        previousRemaining: previousDue,
      };

      const selectedTemplate = templates.find(t => String(t.id) === String(templateId));

      router.push({
        pathname: '/screens/Invoice/preview',
        params: {
          invoiceData: JSON.stringify(previewData),
          template: selectedTemplate?.raw ? JSON.stringify(selectedTemplate.raw) : (selectedTemplate ? JSON.stringify(selectedTemplate) : undefined)
        },
      });
    } catch (err) {
      // console.error("Navigation failed:", err);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white border-b border-slate-200 px-4 py-5 flex-row justify-between items-center z-10">
        <Pressable onPress={onCancel}>
          <Text className="text-primary font-semibold">Cancel</Text>
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">
          {initialData ? 'Edit Invoice' : 'New Invoice'}
        </Text>
        <Pressable style={{ opacity: customer ? 1 : 0.3 }} onPress={() => handleSubmit('Draft')} disabled={loading || !customer}>
          {loading ? <ActivityIndicator size="small" color="#0891B2" /> : <Text className="text-primary font-bold">Save</Text>}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 p-4"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-slate-100">
          <Text className="font-bold text-base mb-3 text-slate-800">
            Invoice Details
          </Text>

          <InputField
            label="Invoice Number"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="Invoice Number"
            containerStyle="mb-3"
          />

          <View className="flex-row gap-3">
            <Pressable onPress={() => setShowInvoiceDatePicker(true)} className="flex-1">
              <Text className="text-sm font-semibold mb-2 text-slate-800">Date</Text>
              <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Text className="text-slate-800">{invoiceDate}</Text>
              </View>
            </Pressable>

            <Pressable onPress={() => setShowDueDatePicker(true)} className="flex-1">
              <Text className="text-sm font-semibold mb-2 text-slate-800">Due Date</Text>
              <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Text className="text-slate-800">{dueDate}</Text>
              </View>
            </Pressable>
          </View>

          {showInvoiceDatePicker && (
            <DateTimePicker value={new Date(invoiceDate)} mode="date" display="default" onChange={handleDateChange} />
          )}
          {showDueDatePicker && (
            <DateTimePicker value={new Date(dueDate)} mode="date" display="default" onChange={handleDateChange} />
          )}
        </View>

        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-slate-100">
          <Text className="font-bold text-base mb-3 text-slate-800">Customer</Text>
          <View className="bg-slate-50 rounded-xl border border-slate-200 mb-3 overflow-hidden">
            <Picker selectedValue={customer?.id} onValueChange={(val) => {
              const c = customers.find(cus => cus.id === val);
              if (c) setCustomer(c);
              else setCustomer(null);
            }}>
              <Picker.Item label="Select Customer" value="" color="#94a3b8" />
              {customers.map(c => <Picker.Item key={c.id || Math.random().toString()} label={c.displayName || 'Unknown Customer'} value={c.id || ''} style={{ fontSize: 14 }} />)}
            </Picker>
          </View>
        </View>

        <View className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <Text className="font-bold text-base mb-2 text-slate-800 px-1">Items</Text>
          {items.map((item, index) => (
            <View key={item.id} className="mb-6 border-b border-slate-100 pb-4 last:border-0 last:pb-0 relative">
              <View className="absolute right-0 top-0">
                <Text className="text-xs font-bold text-slate-400">#{index + 1}</Text>
              </View>

              <Text className="text-xs font-semibold text-slate-500 mb-1">Item</Text>
              <View className="bg-slate-50 rounded-xl border border-slate-200 mb-2 overflow-hidden">
                <Picker selectedValue={item.itemId} onValueChange={(value) => handleItemSelect(item.id, value, itemOptions)}>
                  <Picker.Item label="Select Item" value="" color="#94a3b8" />
                  {itemOptions.map(i => <Picker.Item key={i.id || Math.random().toString()} label={i.name || 'Unnamed Item'} value={i.id || ''} style={{ fontSize: 14 }} />)}
                </Picker>
              </View>

              <View className="flex-row gap-3 mb-2">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-slate-500 mb-1">Quantity</Text>
                  <InputField
                    label=""
                    value={String(item.quantity)}
                    onChangeText={(val) => handleItemChange(item.id, 'quantity', val)}
                    placeholder="0"
                    keyboardType="numeric"
                    containerStyle="mb-0"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-slate-500 mb-1">Unit</Text>
                  <InputField
                    label=""
                    value={item.unit}
                    onChangeText={(val) => handleItemChange(item.id, 'unit', val)}
                    placeholder="Unit"
                    containerStyle="mb-0"
                    editable={false}
                    inputStyle="bg-slate-100 text-slate-500"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-slate-500 mb-1">Rate</Text>
                  <InputField
                    label=""
                    value={String(item.rate)}
                    placeholder="0.00"
                    containerStyle="mb-0"
                    editable={false}
                    inputStyle="bg-slate-100 text-slate-500"
                  />
                </View>
              </View>
            </View>
          ))}

          <Pressable onPress={addItemRow} className="bg-primary/10 border border-primary/20 p-3 rounded-xl items-center flex-row justify-center mt-2">
            <Ionicons name="add-circle-outline" size={20} color="#0891B2" />
            <Text className="text-primary font-bold ml-2">Add Item</Text>
          </Pressable>
        </View>

        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-slate-100">
          <InputField
            label="Notes & Terms"
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter notes and terms here..."
            multiline
            numberOfLines={4}
            inputStyle="min-h-[100px]"
            textAlignVertical="top"
            containerStyle="mb-0"
          />
        </View>

        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-slate-100">
          <Text className="font-bold text-base mb-3 text-slate-800">Template</Text>
          <View className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <Picker selectedValue={templateId} onValueChange={setTemplateId}>
              <Picker.Item label="Select Template" value="" color="#94a3b8" />
              {templates.map(t => <Picker.Item key={t.id || Math.random().toString()} label={t.name || 'Unnamed Template'} value={t.id || ''} style={{ fontSize: 14 }} />)}
            </Picker>
          </View>
        </View>

        <View className="mb-20 px-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-sm font-semibold">Discount (%)</Text>
            <View className="w-20">
              <InputField
                label=""
                value={discountPercent}
                onChangeText={setDiscountPercent}
                keyboardType="numeric"
                placeholder="0"
                containerStyle="mb-0"
                inputStyle="text-right py-1 px-2 h-10"
              />
            </View>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-sm font-semibold">Subtotal</Text>
            <Text className="text-slate-800 text-sm font-bold">{calculateSubTotal().toFixed(2)}</Text>
          </View>
          {customer && (
            <>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-gray-500 text-sm font-semibold">Previous Due</Text>
                <Text className="text-slate-800 text-sm font-bold">{Number(previousDue || 0).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2 px-1 pt-2 border-t border-slate-200">
                <Text className="text-slate-800 font-bold text-base">Grand Total</Text>
                <Text className="text-red-600 font-extrabold text-base">
                  {(Number(previousDue || 0) + calculateTotalAmount()).toFixed(2)} {customer.currency || 'PKR'}
                </Text>
              </View>
            </>
          )}
        </View>

        <Pressable
          className={`p-4 rounded-xl items-center mb-12 ${customer ? 'bg-cyan-600' : 'bg-gray-300'}`}
          onPress={handlePreview}
          disabled={loading || !customer}
        >
          <Text className="text-white font-bold text-base">Preview Invoice</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default InvoiceForm;
