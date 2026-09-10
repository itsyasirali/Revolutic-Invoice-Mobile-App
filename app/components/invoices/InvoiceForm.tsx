import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useInvoiceForm } from '@/hooks/invoices/useInvoiceForm';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../ui/InputField';
import SearchableDropdown from '../ui/SearchableDropdown';
import useCustomerList from '@/hooks/customers/useCustomerList';
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
    items,
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

  const customerOptions = useMemo(() => {
    return customers.map(c => ({
      label: c.displayName || c.companyName || 'Unknown Customer',
      value: c.id,
      sublabel: [c.companyName, c.email].filter(Boolean).join(' • ') || undefined,
    }));
  }, [customers]);

  const itemDropdownOptions = useMemo(() => {
    return itemOptions.map(i => ({
      label: i.name || 'Unnamed Item',
      value: i.id,
      sublabel: i.sellingPrice ? `Price: PKR ${i.sellingPrice} | Unit: ${i.unit || '-'}` : undefined,
    }));
  }, [itemOptions]);

  const templateOptions = useMemo(() => {
    return templates.map(t => ({
      label: t.name || 'Unnamed Template',
      value: t.id,
      sublabel: t.paperSize ? `Paper: ${t.paperSize} | ${t.orientation || 'portrait'}` : undefined,
    }));
  }, [templates]);

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

    const payload = preparePayload();
    if (!payload) return;

    const previewInvoiceData = {
      ...payload,
      id: initialData?.id || "preview-temp-id",
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      customer: customer,
      templateId: templateId || undefined,
    };

    router.push({
      pathname: "/screens/Invoice/preview",
      params: {
        invoiceData: JSON.stringify(previewInvoiceData),
        templateId: templateId || undefined,
      },
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white z-10">
        <Pressable onPress={onCancel}>
          <Text className="text-primary font-semibold text-base">Cancel</Text>
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">
          {initialData ? "Edit Invoice" : "Create Invoice"}
        </Text>
        <Pressable onPress={() => handleSubmit()} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#1AA3FF" />
          ) : (
            <Text className="text-primary font-bold text-base">Save</Text>
          )}
        </Pressable>

      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-slate-100">
          <InputField
            label="Invoice Number"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="INV-0001"
            containerStyle="mb-3"
          />

          <View className="flex-row gap-3 mb-1">
            <Pressable onPress={() => setShowInvoiceDatePicker(true)} className="flex-1">
              <InputField
                label="Invoice Date"
                value={invoiceDate}
                editable={false}
                placeholder="YYYY-MM-DD"
                containerStyle="mb-0"
                rightIcon={<Ionicons name="calendar-outline" size={20} color="#94a3b8" />}
              />
            </Pressable>

            <Pressable onPress={() => setShowDueDatePicker(true)} className="flex-1">
              <InputField
                label="Due Date"
                value={dueDate}
                editable={false}
                placeholder="YYYY-MM-DD"
                containerStyle="mb-0"
                rightIcon={<Ionicons name="calendar-outline" size={20} color="#94a3b8" />}
              />
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
          <SearchableDropdown
            label="Customer *"
            placeholder="Select Customer..."
            searchPlaceholder="Search customers by name, company..."
            value={customer?.id || ''}
            options={customerOptions}
            onSelect={(opt) => {
              const c = customers.find(cus => String(cus.id) === String(opt.value));
              if (c) setCustomer(c);
              else setCustomer(null);
            }}
            clearable
            onClear={() => setCustomer(null)}
            leftIcon={<Ionicons name="person-outline" size={18} color="#1AA3FF" />}
            containerStyle="mb-0"
          />
        </View>

        <View className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <Text className="font-bold text-base mb-2 text-slate-800 px-1">Items</Text>
          {items.map((item, index) => (
            <View key={item.id} className="mb-6 border-b border-slate-100 pb-4 last:border-0 last:pb-0 relative">
              <View className="absolute right-0 top-0">
                <Text className="text-xs font-bold text-slate-400">#{index + 1}</Text>
              </View>

              <Text className="text-xs font-semibold text-slate-500 mb-1">Item</Text>
              <SearchableDropdown
                placeholder="Select Item..."
                searchPlaceholder="Search items..."
                value={item.itemId || ''}
                options={itemDropdownOptions}
                onSelect={(opt) => handleItemSelect(item.id, String(opt.value), itemOptions)}
                containerStyle="mb-2"
                leftIcon={<Ionicons name="cube-outline" size={18} color="#1AA3FF" />}
              />

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
            <Ionicons name="add-circle-outline" size={20} color="#1AA3FF" />
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
          <SearchableDropdown
            label="Template"
            placeholder="Select Template..."
            searchPlaceholder="Search templates..."
            value={templateId || ''}
            options={templateOptions}
            onSelect={(opt) => setTemplateId(String(opt.value))}
            leftIcon={<Ionicons name="document-text-outline" size={18} color="#1AA3FF" />}
            containerStyle="mb-0"
          />
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
            <Text className="text-slate-800 text-sm font-bold">{Number(calculateSubTotal() || 0).toFixed(2)}</Text>
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
          className={`p-4 rounded-xl items-center mb-12 ${customer ? 'bg-primary' : 'bg-gray-300'}`}
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
