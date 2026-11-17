import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRecordList } from '@/hooks/records/useRecordList';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate, formatDuration } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import { useTimeEntryListMenu } from '@/hooks/records/listMenus';
import { RecordList, RecordCard } from '../records/RecordList';
import TimeEntryForm from './TimeEntryForm';
import TimerCard from './TimerCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unbilled', label: 'Unbilled' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'non-billable', label: 'Non-Billable' },
];

const TimeEntryList = () => {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [preset, setPreset] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const list = useRecordList<any>({
    url: '/api/time-tracking',
    listKey: 'timeEntries',
    searchText: (t) =>
      `${t.entryNumber} ${t.project || ''} ${t.description || ''} ${t.customer?.displayName || ''} ${t.task?.name || ''}`,
    matchFilter: (t, f) => String(t.status || '').toLowerCase() === f,
  });

  const { rows, menu } = useTimeEntryListMenu(list.visible, list.refresh);

  useFocusEffect(
    useCallback(() => {
      list.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const close = () => {
    setShowAdd(false);
    setPreset(null);
  };

  return (
    <RecordList
      title="Time Tracking"
      emptyIcon="schedule"
      emptyText={`No ${list.filter === 'all' ? '' : list.filter} time entries found`}
      searchPlaceholder="Search time entries..."
      data={rows}
      loading={list.loading}
      refreshing={list.refreshing}
      onRefresh={list.refresh}
      search={list.search}
      onSearch={list.setSearch}
      filters={FILTERS}
      filter={list.filter}
      onFilter={list.setFilter}
      onAdd={() => setShowAdd(true)}
      menu={menu}
      header={
        <TimerCard
          onStop={(p) => {
            setPreset(p);
            setShowAdd(true);
          }}
        />
      }
      keyOf={(t) => String(t.id)}
      renderItem={(t) => (
        <RecordCard
          onPress={() => router.push({ pathname: '/screens/TimeTracking/details' as any, params: { id: String(t.id), record: JSON.stringify(t) } })}
          initial={(t.project?.[0] || t.customer?.displayName?.[0] || 'T').toUpperCase()}
          title={t.project || t.description || t.entryNumber}
          subtitle={[t.entryNumber, formatDate(t.date), t.customer?.displayName].filter(Boolean).join(' • ')}
          badge={{ label: t.status, ...getStatusStyle(t.status) }}
          stats={[
            { label: 'Duration', value: formatDuration(t.duration) },
            { label: 'Amount', value: formatMoney(t.amount, t.customer?.currency) },
          ]}
        />
      )}
    >
      <StandardModal visible={showAdd} onClose={close}>
        <TimeEntryForm
          preset={preset}
          onCancel={close}
          onSuccess={() => {
            close();
            list.reload();
          }}
        />
      </StandardModal>
    </RecordList>
  );
};

export default TimeEntryList;
