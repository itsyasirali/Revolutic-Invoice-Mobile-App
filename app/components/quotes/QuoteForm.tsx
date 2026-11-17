import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import { useCustomerOptions, useItemOptions } from '@/hooks/records/useLookups';
import { formatMoney } from '@/utils/money';
import InputField from '../ui/InputField';
import SearchableDropdown from '../ui/SearchableDropdown';
import { FormShell } from '../records/FormParts';

const today = () => new Date().toISOString().slice(0, 10);
const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);

interface Line {
  itemId: string | number | '';
  name: string;
  quantity: string;
  rate: string;
  discount: string;
  tax: string;
}

const emptyLine = (): Line => ({ itemId: '', name: '', quantity: '1', rate: '', discount: '', tax: '' });

interface Props {
  quote?: any | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const QuoteForm: React.FC<Props> = ({ quote, onCancel, onSuccess }) => {
  const isEditing = !!quote?.id;
  const { customers, options: customerOptions } = useCustomerOptions();
  const { items: catalog, options: itemOptions } = useItemOptions();

  const [customerId, setCustomerId] = useState<string | number>(quote?.customerId ?? '');
  const [quoteDate, setQuoteDate] = useState(String(quote?.quoteDate || today()).slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(quote?.expiryDate ? String(quote.expiryDate).slice(0, 10) : '');
  const [referenceNumber, setReferenceNumber] = useState(quote?.referenceNumber || '');
  const [lines, setLines] = useState<Line[]>(
    quote?.items?.length
      ? quote.items.map((i: any) => ({
          itemId: i.itemId ?? '',
          name: i.name || '',
          quantity: String(i.quantity ?? 1),
          rate: String(i.rate ?? ''),
          discount: i.discount ? String(i.discount) : '',
          tax: i.tax ? String(i.tax) : '',
        }))
      : [emptyLine()]
  );
  const [discountPercent, setDiscountPercent] = useState(quote?.discountPercent ? String(quote.discountPercent) : '');
  const [shipping, setShipping] = useState(quote?.shipping && Number(quote.shipping) ? String(quote.shipping) : '');
  const [adjustment, setAdjustment] = useState(quote?.adjustment && Number(quote.adjustment) ? String(quote.adjustment) : '');
  const [notes, setNotes] = useState(quote?.notes || '');
  const [terms, setTerms] = useState(quote?.terms || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customer = customers.find((c: any) => String(c.id) === String(customerId));
  const currency = quote?.currency || customer?.currency || '';

  // Same math as the server (the server remains the source of truth).
  const totals = useMemo(() => {
    const lineAmounts = lines.map((l) => {
      const gross = num(l.quantity) * num(l.rate);
      const taxable = gross - (gross * Math.min(100, Math.max(0, num(l.discount)))) / 100;
      return taxable + (taxable * Math.max(0, num(l.tax))) / 100;
    });
    const sub = lineAmounts.reduce((a, b) => a + b, 0);
    const disc = (sub * Math.min(100, Math.max(0, num(discountPercent)))) / 100;
    return { sub, disc, total: sub - disc + num(shipping) + num(adjustment) };
  }, [lines, discountPercent, shipping, adjustment]);

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const pickItem = (i: number, itemId: string | number) => {
    const found = catalog.find((c: any) => String(c.id) === String(itemId));
    setLine(i, { itemId, name: found?.name || '', rate: found?.sellingPrice != null ? String(found.sellingPrice) : '' });
  };

  const handleSave = async () => {
    if (!customerId) return setError('Select a customer');
    const valid = lines.filter((l) => l.name.trim() && num(l.quantity) > 0);
    if (valid.length === 0) return setError('Add at least one item');
    setSaving(true);
    setError(null);
    try {
      const body = {
        customerId: Number(customerId),
        quoteDate,
        expiryDate: expiryDate || null,
        currency: currency || undefined,
        referenceNumber,
        items: valid.map((l) => ({
          itemId: l.itemId || null,
          name: l.name.trim(),
          quantity: num(l.quantity),
          rate: num(l.rate),
          discount: num(l.discount),
          tax: num(l.tax),
        })),
        discountPercent: num(discountPercent),
        shipping: num(shipping),
        adjustment: num(adjustment),
        notes,
        terms,
      };
      if (isEditing) await axios.put(`/api/quotes/${quote.id}`, body);
      else await axios.post('/api/quotes', body);
      showToast('success', isEditing ? 'Quote updated' : 'Quote created');
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormShell title={isEditing ? 'Edit Quote' : 'Add Quote'} saving={saving} onCancel={onCancel} onSave={handleSave} error={error}>
      <SearchableDropdown
        label="Customer *"
        placeholder="Select Customer..."
        searchPlaceholder="Search customers by name, company..."
        value={customerId}
        options={customerOptions}
        onSelect={(o) => setCustomerId(o.value)}
        leftIcon={<Ionicons name="person-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField label="Quote Date *" value={quoteDate} onChangeText={setQuoteDate} placeholder="YYYY-MM-DD" />
        </View>
        <View className="flex-1">
          <InputField label="Expiry Date" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
        </View>
      </View>
      <InputField label="Reference Number" value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Optional" />

      <Text className="text-sm font-semibold mb-2 text-slate-800">Items</Text>
      {lines.map((l, i) => (
        <View key={i} className="bg-white rounded-md border border-slate-100 p-3 mb-3">
          <SearchableDropdown
            placeholder="Select Item..."
            searchPlaceholder="Search items..."
            value={l.itemId}
            options={itemOptions}
            onSelect={(o) => pickItem(i, o.value)}
            containerStyle="mb-3"
          />
          <InputField
            value={l.name}
            onChangeText={(v) => setLine(i, { name: v })}
            placeholder="Item name"
            containerStyle="mb-3"
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <InputField label="Qty" labelStyle="text-xs font-semibold text-slate-500 mb-1" value={l.quantity} onChangeText={(v) => setLine(i, { quantity: v })} keyboardType="numeric" containerStyle="mb-0" />
            </View>
            <View className="flex-1">
              <InputField label="Rate" labelStyle="text-xs font-semibold text-slate-500 mb-1" value={l.rate} onChangeText={(v) => setLine(i, { rate: v })} keyboardType="numeric" placeholder="0.00" containerStyle="mb-0" />
            </View>
            <View className="flex-1">
              <InputField label="Disc %" labelStyle="text-xs font-semibold text-slate-500 mb-1" value={l.discount} onChangeText={(v) => setLine(i, { discount: v })} keyboardType="numeric" placeholder="0" containerStyle="mb-0" />
            </View>
            <View className="flex-1">
              <InputField label="Tax %" labelStyle="text-xs font-semibold text-slate-500 mb-1" value={l.tax} onChangeText={(v) => setLine(i, { tax: v })} keyboardType="numeric" placeholder="0" containerStyle="mb-0" />
            </View>
          </View>
          {lines.length > 1 && (
            <Pressable onPress={() => setLines((p) => p.filter((_, idx) => idx !== i))} className="self-end mt-3 flex-row items-center">
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
              <Text className="text-red-600 text-sm ml-1">Remove</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Pressable onPress={() => setLines((p) => [...p, emptyLine()])} className="flex-row items-center mb-5">
        <Ionicons name="add-circle-outline" size={20} color="#1AA3FF" />
        <Text className="text-primary font-bold ml-2">Add Item</Text>
      </Pressable>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField label="Discount %" value={discountPercent} onChangeText={setDiscountPercent} keyboardType="numeric" placeholder="0" />
        </View>
        <View className="flex-1">
          <InputField label="Shipping" value={shipping} onChangeText={setShipping} keyboardType="numeric" placeholder="0.00" />
        </View>
        <View className="flex-1">
          <InputField label="Adjustment" value={adjustment} onChangeText={setAdjustment} keyboardType="numeric" placeholder="0.00" />
        </View>
      </View>

      <View className="bg-white rounded-md border border-slate-100 p-4 mb-5">
        <View className="flex-row justify-between mb-1">
          <Text className="text-slate-500">Subtotal</Text>
          <Text className="text-slate-800 font-semibold">{formatMoney(totals.sub, currency)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-500">Discount</Text>
          <Text className="text-slate-800 font-semibold">-{formatMoney(totals.disc, currency)}</Text>
        </View>
        <View className="flex-row justify-between pt-2 border-t border-slate-100">
          <Text className="text-slate-800 font-bold text-base">Total</Text>
          <Text className="text-slate-800 font-bold text-base">{formatMoney(totals.total, currency)}</Text>
        </View>
      </View>

      <InputField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes visible on the quote"
        multiline
        numberOfLines={3}
        inputStyle="text-slate-800 text-base flex-1 h-20"
        textAlignVertical="top"
      />
      <InputField
        label="Terms & Conditions"
        value={terms}
        onChangeText={setTerms}
        placeholder="Payment terms, validity..."
        multiline
        numberOfLines={3}
        inputStyle="text-slate-800 text-base flex-1 h-20"
        textAlignVertical="top"
      />
    </FormShell>
  );
};

export default QuoteForm;
