import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { IP } from '@/utils/IP';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/services/api';
import { useRecord } from '@/hooks/records/useRecord';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import RecordDetails from '../records/RecordDetails';
import ExpenseForm from './ExpenseForm';

const ExpenseDetails = () => {
  const router = useRouter();
  const { id, record } = useLocalSearchParams();
  const { payload, loading, reload } = useRecord<any>('/api/expenses', id, record, 'expense');
  const [showEdit, setShowEdit] = useState(false);
  const expense = payload?.expense;

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/Expenses' as any));

  const handleDelete = () =>
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`/api/expenses/${expense.id}`);
            handleBack();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);

  const receiptUrl = expense?.attachment
    ? /^(https?:|data:)/i.test(expense.attachment)
      ? expense.attachment
      : `${IP}/${String(expense.attachment).replace(/^\//, '')}`
    : null;

  const canBill = !!expense && expense.billable && !expense.invoiced && !!expense.customerId;

  const handleBill = () =>
    Alert.alert('Bill to invoice', 'Create an invoice from this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async () => {
          try {
            const res = await axios.post('/api/expenses/invoice', { expenseIds: [expense.id] });
            await reload();
            const num = res.data?.invoice?.invoiceNumber;
            Alert.alert('Invoice created', num ? `Invoice ${num} was created.` : 'Invoice created.');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to create invoice');
          }
        },
      },
    ]);

  if (!loading && !expense) return null;
  const locked = !!expense?.invoiced;

  return (
    <RecordDetails
      title={expense?.expenseNumber || ''}
      loading={loading}
      onBack={handleBack}
      onEdit={locked ? undefined : () => setShowEdit(true)}
      actions={[
        ...(canBill ? [{ label: 'Bill to Invoice', icon: 'receipt' as const, onPress: handleBill }] : []),
        ...(receiptUrl ? [{ label: 'View Receipt', icon: 'attach-file' as const, onPress: () => Linking.openURL(receiptUrl) }] : []),
        ...(locked ? [] : [{ label: 'Delete', icon: 'delete-outline' as const, danger: true, onPress: handleDelete }]),
      ]}
      stats={[
        { label: 'Total', value: formatMoney(expense?.total, expense?.currency) },
        { label: 'Date', value: formatDate(expense?.expenseDate) },
      ]}
      icon="wallet-outline"
      name={expense?.vendor || expense?.category?.name || expense?.expenseNumber || ''}
      badge={expense ? { label: expense.status, ...getStatusStyle(expense.status) } : undefined}
      description={expense?.description}
      rows={[
        { label: 'Expense Number', value: expense?.expenseNumber },
        { label: 'Category', value: expense?.category?.name },
        { label: 'Vendor', value: expense?.vendor },
        { label: 'Customer', value: expense?.customer?.displayName || expense?.customer?.companyName },
        { label: 'Project', value: expense?.projectRef?.name },
        { label: 'Amount', value: formatMoney(expense?.amount, expense?.currency) },
        { label: 'Tax', value: `${expense?.taxPercent ?? 0}% (${formatMoney(expense?.tax, expense?.currency)})` },
        { label: 'Total', value: formatMoney(expense?.total, expense?.currency) },
        { label: 'Payment Method', value: expense?.paymentMethod },
        { label: 'Reference', value: expense?.referenceNumber },
        { label: 'Billable', value: expense?.billable ? 'Yes' : 'No' },
        { label: 'Invoice', value: expense?.invoice?.invoiceNumber },
        { label: 'Receipt', value: receiptUrl ? 'Attached' : null },
        { label: 'Notes', value: expense?.notes },
      ]}
      modals={
        <StandardModal visible={showEdit} onClose={() => setShowEdit(false)}>
          <ExpenseForm
            expense={expense}
            onCancel={() => setShowEdit(false)}
            onSuccess={() => {
              setShowEdit(false);
              reload();
            }}
          />
        </StandardModal>
      }
    />
  );
};

export default ExpenseDetails;
