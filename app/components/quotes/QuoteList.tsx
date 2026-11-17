import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRecordList } from '@/hooks/records/useRecordList';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import { useQuoteListMenu } from '@/hooks/records/listMenus';
import { RecordList, RecordCard } from '../records/RecordList';
import QuoteForm from './QuoteForm';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'expired', label: 'Expired' },
  { key: 'converted', label: 'Converted' },
];

const QuoteList = () => {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const list = useRecordList<any>({
    url: '/api/quotes',
    listKey: 'quotes',
    searchText: (q) => `${q.quoteNumber} ${q.referenceNumber || ''} ${q.customer?.displayName || ''} ${q.customer?.companyName || ''}`,
    matchFilter: (q, f) => String(q.status || '').toLowerCase() === f,
  });

  const { rows, menu } = useQuoteListMenu(list.visible, list.refresh);

  useFocusEffect(
    useCallback(() => {
      list.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <RecordList
      title="Quotes"
      emptyIcon="description"
      emptyText={`No ${list.filter === 'all' ? '' : list.filter} quotes found`}
      searchPlaceholder="Search quotes..."
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
      keyOf={(q) => String(q.id)}
      renderItem={(q) => {
        const name = q.customer?.displayName || q.customer?.companyName || 'Customer';
        return (
          <RecordCard
            onPress={() => router.push({ pathname: '/screens/Quotes/details' as any, params: { id: String(q.id), record: JSON.stringify(q) } })}
            initial={name[0]?.toUpperCase() || 'Q'}
            title={name}
            subtitle={q.quoteNumber}
            badge={{ label: q.status, ...getStatusStyle(q.status) }}
            stats={[
              { label: 'Expires', value: formatDate(q.expiryDate) },
              { label: 'Total', value: formatMoney(q.total, q.currency) },
            ]}
          />
        );
      }}
    >
      <StandardModal visible={showAdd} onClose={() => setShowAdd(false)}>
        <QuoteForm
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

export default QuoteList;
