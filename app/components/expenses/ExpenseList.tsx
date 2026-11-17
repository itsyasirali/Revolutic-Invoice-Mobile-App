import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRecordList } from '@/hooks/records/useRecordList';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import { RecordList, RecordCard } from '../records/RecordList';
import ExpenseForm from './ExpenseForm';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unbilled', label: 'Unbilled' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'non-billable', label: 'Non-Billable' },
];

const ExpenseList = () => {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const list = useRecordList<any>({
    url: '/api/expenses',
    listKey: 'expenses',
    searchText: (e) =>
      `${e.expenseNumber} ${e.vendor || ''} ${e.description || ''} ${e.category?.name || ''} ${e.customer?.displayName || ''}`,
    matchFilter: (e, f) => String(e.status || '').toLowerCase() === f,
  });

  useFocusEffect(
    useCallback(() => {
      list.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <RecordList
      title="Expenses"
      emptyIcon="receipt-long"
      emptyText={`No ${list.filter === 'all' ? '' : list.filter} expenses found`}
      searchPlaceholder="Search expenses..."
      data={list.visible}
      loading={list.loading}
      refreshing={list.refreshing}
      onRefresh={list.refresh}
      search={list.search}
      onSearch={list.setSearch}
      filters={FILTERS}
      filter={list.filter}
      onFilter={list.setFilter}
      onAdd={() => setShowAdd(true)}
      keyOf={(e) => String(e.id)}
      renderItem={(e) => (
        <RecordCard
          onPress={() => router.push({ pathname: '/screens/Expenses/details' as any, params: { id: String(e.id), record: JSON.stringify(e) } })}
          initial={(e.vendor?.[0] || e.category?.name?.[0] || 'E').toUpperCase()}
          title={e.vendor || e.category?.name || e.expenseNumber}
          subtitle={[e.expenseNumber, e.category?.name].filter(Boolean).join(' • ')}
          badge={{ label: e.status, ...getStatusStyle(e.status) }}
          stats={[
            { label: 'Date', value: formatDate(e.expenseDate) },
            { label: 'Total', value: formatMoney(e.total, e.currency) },
          ]}
        />
      )}
    >
      <StandardModal visible={showAdd} onClose={() => setShowAdd(false)}>
        <ExpenseForm
          onCancel={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            list.reload();
          }}
        />
      </StandardModal>
    </RecordList>
  );
};

export default ExpenseList;
