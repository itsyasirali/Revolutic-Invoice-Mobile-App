import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import { useCustomerOptions, useProjectOptions, useExpenseCategoryOptions } from '@/hooks/records/useLookups';
import InputField from '../ui/InputField';
import SearchableDropdown from '../ui/SearchableDropdown';
import { FormShell, ChipSelect, ToggleRow } from '../records/FormParts';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'Debit Card', 'Other'] as const;
const today = () => new Date().toISOString().slice(0, 10);

interface Props {
  expense?: any | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ExpenseForm: React.FC<Props> = ({ expense, onCancel, onSuccess }) => {
  const isEditing = !!expense?.id;
  const { options: customerOptions } = useCustomerOptions();
  const { options: projectOptions, projects } = useProjectOptions();
  const { options: categoryOptions } = useExpenseCategoryOptions();

  const [expenseDate, setExpenseDate] = useState(String(expense?.expenseDate || today()).slice(0, 10));
  const [vendor, setVendor] = useState(expense?.vendor || '');
  const [categoryId, setCategoryId] = useState<string | number>(expense?.categoryId ?? '');
  const [customerId, setCustomerId] = useState<string | number>(expense?.customerId ?? '');
  const [projectId, setProjectId] = useState<string | number>(expense?.projectId ?? '');
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount != null ? String(expense.amount) : '');
  const [taxPercent, setTaxPercent] = useState(expense?.taxPercent != null ? String(expense.taxPercent) : '');
  const [paymentMethod, setPaymentMethod] = useState<string>(expense?.paymentMethod || 'Cash');
  const [referenceNumber, setReferenceNumber] = useState(expense?.referenceNumber || '');
  const [billable, setBillable] = useState<boolean>(!!expense?.billable);
  const [notes, setNotes] = useState(expense?.notes || '');
  const [receipt, setReceipt] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingReceipt = !removeReceipt && !receipt ? expense?.attachment : null;

  const pickReceipt = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setReceipt({ uri: a.uri, name: a.name || 'receipt', type: a.mimeType || 'application/octet-stream' });
    setRemoveReceipt(false);
  };

  const handleSave = async () => {
    if (!(Number(amount) > 0)) return setError('Enter an amount greater than 0');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) return setError('Date must be YYYY-MM-DD');
    setSaving(true);
    setError(null);
    try {
      const project = projects.find((p) => String(p.id) === String(projectId));
      const body: Record<string, any> = {
        expenseDate,
        vendor,
        categoryId: categoryId || null,
        // A project always carries its own customer on the server.
        customerId: project?.customerId ?? (customerId || null),
        projectId: projectId || null,
        description,
        amount: Number(amount),
        taxPercent: Number(taxPercent) || 0,
        paymentMethod,
        referenceNumber,
        billable,
        notes,
      };
      // A receipt goes up as multipart (same fields the web form sends); otherwise plain JSON.
      let payload: any = body;
      let config: any;
      if (receipt || removeReceipt) {
        const form = new FormData();
        Object.entries(body).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') form.append(k, String(v));
        });
        if (receipt) form.append('attachment', { uri: receipt.uri, name: receipt.name, type: receipt.type } as any);
        if (removeReceipt && !receipt) form.append('removeAttachment', 'true');
        payload = form;
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }
      if (isEditing) await axios.put(`/api/expenses/${expense.id}`, payload, config);
      else await axios.post('/api/expenses', payload, config);
      showToast('success', isEditing ? 'Expense updated' : 'Expense created');
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormShell title={isEditing ? 'Edit Expense' : 'Add Expense'} saving={saving} onCancel={onCancel} onSave={handleSave} error={error}>
      <InputField label="Date *" value={expenseDate} onChangeText={setExpenseDate} placeholder="YYYY-MM-DD" />
      <InputField label="Vendor" value={vendor} onChangeText={setVendor} placeholder="Who was paid" />
      <SearchableDropdown
        label="Category"
        placeholder="Select Category..."
        searchPlaceholder="Search categories..."
        value={categoryId}
        options={categoryOptions}
        onSelect={(o) => setCategoryId(o.value)}
        clearable
        onClear={() => setCategoryId('')}
        leftIcon={<Ionicons name="pricetag-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField label="Amount *" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
        </View>
        <View className="flex-1">
          <InputField label="Tax %" value={taxPercent} onChangeText={setTaxPercent} placeholder="0" keyboardType="numeric" />
        </View>
      </View>
      <SearchableDropdown
        label="Customer"
        placeholder="Select Customer..."
        searchPlaceholder="Search customers..."
        value={customerId}
        options={customerOptions}
        onSelect={(o) => setCustomerId(o.value)}
        clearable
        onClear={() => setCustomerId('')}
        leftIcon={<Ionicons name="person-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <SearchableDropdown
        label="Project"
        placeholder="Select Project..."
        searchPlaceholder="Search projects..."
        value={projectId}
        options={projectOptions}
        onSelect={(o) => setProjectId(o.value)}
        clearable
        onClear={() => setProjectId('')}
        leftIcon={<Ionicons name="briefcase-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <ChipSelect label="Payment Method" options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
      <InputField label="Reference Number" value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Optional" />
      <ToggleRow label="Billable to customer" value={billable} onChange={setBillable} />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What was this for?"
        multiline
        numberOfLines={3}
        inputStyle="text-slate-800 text-base flex-1 h-20"
        textAlignVertical="top"
      />
      <View className="mb-5">
        <Text className="text-sm font-semibold mb-2 text-slate-800">Receipt</Text>
        <Pressable
          onPress={pickReceipt}
          className="flex-row items-center bg-white border border-dashed border-slate-300 rounded-md px-4 py-3.5 active:bg-slate-50"
        >
          <Ionicons name="attach-outline" size={20} color="#1AA3FF" />
          <Text className="ml-2 text-slate-700 flex-1" numberOfLines={1}>
            {receipt ? receipt.name : existingReceipt ? 'Receipt attached (tap to replace)' : 'Attach image or PDF'}
          </Text>
          {(receipt || existingReceipt) && (
            <Pressable
              onPress={() => {
                setReceipt(null);
                setRemoveReceipt(true);
              }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </Pressable>
          )}
        </Pressable>
      </View>
      <InputField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Internal notes"
        multiline
        numberOfLines={3}
        inputStyle="text-slate-800 text-base flex-1 h-20"
        textAlignVertical="top"
      />
    </FormShell>
  );
};

export default ExpenseForm;
