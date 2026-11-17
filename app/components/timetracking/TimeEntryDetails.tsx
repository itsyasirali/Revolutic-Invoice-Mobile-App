import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/services/api';
import { useRecord } from '@/hooks/records/useRecord';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate, formatDuration } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import RecordDetails, { DetailAction } from '../records/RecordDetails';
import TimeEntryForm from './TimeEntryForm';

const TimeEntryDetails = () => {
  const router = useRouter();
  const { id, record } = useLocalSearchParams();
  const { payload, loading, reload } = useRecord<any>('/api/time-tracking', id, record, 'timeEntry');
  const [showEdit, setShowEdit] = useState(false);
  const entry = payload?.timeEntry;

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/TimeTracking' as any));

  const handleDelete = () =>
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`/api/time-tracking/${entry.id}`);
            handleBack();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);

  const handleBill = () =>
    Alert.alert('Bill to invoice', 'Create an invoice from this time entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async () => {
          try {
            const res = await axios.post('/api/time-tracking/invoice', { timeEntryIds: [entry.id] });
            await reload();
            const num = res.data?.invoice?.invoiceNumber;
            Alert.alert('Invoice created', num ? `Invoice ${num} was created.` : 'Invoice created.');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to create invoice');
          }
        },
      },
    ]);

  if (!loading && !entry) return null;
  const locked = !!entry?.invoiced;
  const canBill = !!entry && entry.billable && !entry.invoiced;

  const actions: DetailAction[] = [];
  if (canBill) actions.push({ label: 'Bill to Invoice', icon: 'receipt', onPress: handleBill });
  if (!locked) actions.push({ label: 'Delete', icon: 'delete-outline', danger: true, onPress: handleDelete });

  return (
    <RecordDetails
      title={entry?.entryNumber || ''}
      loading={loading}
      onBack={handleBack}
      onEdit={locked ? undefined : () => setShowEdit(true)}
      actions={actions}
      stats={[
        { label: 'Duration', value: formatDuration(entry?.duration) },
        { label: 'Amount', value: formatMoney(entry?.amount, entry?.customer?.currency) },
      ]}
      icon="time-outline"
      name={entry?.project || entry?.description || entry?.entryNumber || ''}
      badge={entry ? { label: entry.status, ...getStatusStyle(entry.status) } : undefined}
      description={entry?.description}
      rows={[
        { label: 'Entry Number', value: entry?.entryNumber },
        { label: 'Date', value: formatDate(entry?.date) },
        { label: 'Start', value: entry?.startTime },
        { label: 'End', value: entry?.endTime },
        { label: 'Project', value: entry?.project },
        { label: 'Task', value: entry?.task?.name },
        { label: 'Customer', value: entry?.customer?.displayName || entry?.customer?.companyName },
        { label: 'Hourly Rate', value: formatMoney(entry?.hourlyRate, entry?.customer?.currency) },
        { label: 'Billable', value: entry?.billable ? 'Yes' : 'No' },
        { label: 'Invoice', value: entry?.invoice?.invoiceNumber },
      ]}
      modals={
        <StandardModal visible={showEdit} onClose={() => setShowEdit(false)}>
          <TimeEntryForm
            entry={entry}
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

export default TimeEntryDetails;
