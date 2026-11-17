import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/services/api';
import { useRecord } from '@/hooks/records/useRecord';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import RecordDetails from '../records/RecordDetails';
import ProjectForm from './ProjectForm';
import ProjectTasks from './ProjectTasks';

const hours = (minutes?: number) => `${((minutes || 0) / 60).toFixed(1)} h`;

const ProjectDetails = () => {
  const router = useRouter();
  const { id, record } = useLocalSearchParams();
  const { payload, loading, reload } = useRecord<any>('/api/projects', id, record, 'project');
  const [showEdit, setShowEdit] = useState(false);
  const project = payload?.project;
  const tasks: any[] = payload?.tasks ?? [];

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/Projects' as any));

  const handleDelete = () =>
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`/api/projects/${project.id}`);
            handleBack();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);

  if (!loading && !project) return null;
  const st = getStatusStyle(project?.status);
  const stats = project?.stats || {};
  const rate = project?.billingMethod === 'Fixed' ? project?.fixedAmount : project?.hourlyRate;

  return (
    <RecordDetails
      title={project?.name || ''}
      loading={loading}
      onBack={handleBack}
      onEdit={() => setShowEdit(true)}
      actions={[{ label: 'Delete', icon: 'delete-outline', danger: true, onPress: handleDelete }]}
      stats={[
        { label: project?.billingMethod === 'Fixed' ? 'Fixed Amount' : 'Hourly Rate', value: formatMoney(rate, project?.currency) },
        { label: 'Logged', value: hours(stats.loggedMinutes) },
      ]}
      icon="briefcase-outline"
      name={project?.name || ''}
      badge={project ? { label: project.status, ...st } : undefined}
      description={project?.description}
      extra={project ? <ProjectTasks projectId={project.id} tasks={tasks} onChanged={reload} /> : null}
      rows={[
        { label: 'Project Number', value: project?.projectNumber },
        { label: 'Customer', value: project?.customer?.displayName || project?.customer?.companyName },
        { label: 'Status', value: project?.status },
        { label: 'Billing Method', value: project?.billingMethod },
        { label: 'Hourly Rate', value: formatMoney(project?.hourlyRate, project?.currency) },
        { label: 'Fixed Amount', value: formatMoney(project?.fixedAmount, project?.currency) },
        { label: 'Budget Hours', value: String(project?.budgetHours ?? 0) },
        { label: 'Budget Amount', value: formatMoney(project?.budgetAmount, project?.currency) },
        { label: 'Billable Time', value: hours(stats.billableMinutes) },
        { label: 'Non-Billable Time', value: hours(stats.nonBillableMinutes) },
        { label: 'Unbilled Time', value: formatMoney(stats.unbilledTimeAmount, project?.currency) },
        { label: 'Invoiced Time', value: formatMoney(stats.invoicedTimeAmount, project?.currency) },
        { label: 'Expenses', value: formatMoney(stats.expenseTotal, project?.currency) },
        { label: 'Start Date', value: formatDate(project?.startDate) },
        { label: 'End Date', value: formatDate(project?.endDate) },
      ]}
      modals={
        <StandardModal visible={showEdit} onClose={() => setShowEdit(false)}>
          <ProjectForm
            project={project}
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

export default ProjectDetails;
