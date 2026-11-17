import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRecordList } from '@/hooks/records/useRecordList';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import { useProjectListMenu } from '@/hooks/records/listMenus';
import { RecordList, RecordCard } from '../records/RecordList';
import ProjectForm from './ProjectForm';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'on hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

const ProjectList = () => {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const list = useRecordList<any>({
    url: '/api/projects',
    listKey: 'projects',
    searchText: (p) => `${p.name} ${p.projectNumber} ${p.customer?.displayName || ''} ${p.customer?.companyName || ''}`,
    matchFilter: (p, f) => String(p.status || '').toLowerCase() === f,
  });

  const { rows, menu } = useProjectListMenu(list.visible, list.refresh);

  useFocusEffect(
    useCallback(() => {
      list.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <RecordList
      title="Projects"
      emptyIcon="work-outline"
      emptyText={`No ${list.filter === 'all' ? '' : list.filter} projects found`}
      searchPlaceholder="Search projects..."
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
      keyOf={(p) => String(p.id)}
      renderItem={(p) => {
        const st = getStatusStyle(p.status);
        const rate = p.billingMethod === 'Fixed' ? p.fixedAmount : p.hourlyRate;
        return (
          <RecordCard
            onPress={() => router.push({ pathname: '/screens/Projects/details' as any, params: { id: String(p.id), record: JSON.stringify(p) } })}
            initial={(p.name?.[0] || 'P').toUpperCase()}
            title={p.name}
            subtitle={[p.projectNumber, p.customer?.displayName || p.customer?.companyName].filter(Boolean).join(' • ')}
            badge={{ label: p.status, ...st }}
            stats={[
              { label: p.billingMethod === 'Fixed' ? 'Fixed' : 'Hourly Rate', value: formatMoney(rate, p.currency) },
              { label: 'Unbilled', value: formatMoney(p.stats?.unbilledTimeAmount, p.currency) },
            ]}
          />
        );
      }}
    >
      <StandardModal visible={showAdd} onClose={() => setShowAdd(false)}>
        <ProjectForm
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

export default ProjectList;
