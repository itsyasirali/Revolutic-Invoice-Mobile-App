import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import { useRecord } from '@/hooks/records/useRecord';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import RecordDetails from '../records/RecordDetails';
import ProjectForm from './ProjectForm';
import ProjectTasks from './ProjectTasks';
import TimeEntryForm from '../timetracking/TimeEntryForm';

const hours = (minutes?: number) => `${((minutes || 0) / 60).toFixed(1)} h`;

const ProjectDetails = () => {
  const router = useRouter();
  const { id, record } = useLocalSearchParams();
  const { payload, setPayload, loading, reload } = useRecord<any>('/api/projects', id, record, 'project');
  const [showEdit, setShowEdit] = useState(false);
  const [timePreset, setTimePreset] = useState<{ date: string; startTime: string; endTime: string; taskId: number } | null>(null);
  const project = payload?.project;
  const tasks: any[] = payload?.tasks ?? [];

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/Projects' as any));

  const applyStatus = async (status: 'Completed' | 'Active') => {
    try {
      const res = await axios.put(`/api/projects/${project.id}`, { status });
      // The reply has no totals, so keep the ones already loaded.
      setPayload((p: any) => (p ? { ...p, project: { ...p.project, ...res.data?.project, stats: p.project?.stats } } : p));
      return true;
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update project');
      return false;
    }
  };

  // The project follows its tasks: all done completes it; reopening or adding a task reopens it.
  const syncStatus = async (next: { status: string }[]) => {
    if (!project) return;
    const allDone = next.length > 0 && next.every((t) => t.status === 'Completed');
    if (allDone && project.status !== 'Completed') {
      if (await applyStatus('Completed')) showToast('success', 'All tasks done. Project marked as completed');
    } else if (!allDone && project.status === 'Completed') {
      if (await applyStatus('Active')) showToast('success', 'Project reopened');
    }
  };

  // Complete (or reopen) the whole project from the menu. Only the status changes.
  const handleSetStatus = (status: 'Completed' | 'Active') =>
    Alert.alert(status === 'Completed' ? 'Mark as completed' : 'Reopen project', status === 'Completed' ? 'Mark this project as completed? Its timers will be hidden.' : 'Reopen this project?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: status === 'Completed' ? 'Complete' : 'Reopen',
        onPress: async () => {
          if (await applyStatus(status)) Alert.alert('Success', status === 'Completed' ? 'Project marked as completed' : 'Project reopened');
        },
      },
    ]);

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
      actions={[
        project?.status === 'Completed'
          ? { label: 'Reopen Project', icon: 'refresh' as const, onPress: () => handleSetStatus('Active') }
          : { label: 'Mark as Completed', icon: 'check-circle-outline' as const, onPress: () => handleSetStatus('Completed') },
        { label: 'Delete', icon: 'delete-outline' as const, danger: true, onPress: handleDelete },
      ]}
      stats={[
        { label: project?.billingMethod === 'Fixed' ? 'Fixed Amount' : 'Hourly Rate', value: formatMoney(rate, project?.currency) },
        { label: 'Logged', value: hours(stats.loggedMinutes) },
      ]}
      icon="briefcase-outline"
      name={project?.name || ''}
      badge={project ? { label: project.status, ...st } : undefined}
      description={project?.description}
      extra={
        project ? (
          <>
            <ProjectTasks
              projectId={project.id}
              tasks={tasks}
              onTasks={(update) => setPayload((p: any) => (p ? { ...p, tasks: update(p.tasks ?? []) } : p))}
              timerEnabled={project.billingMethod === 'Hourly' && project.status !== 'Completed'}
              onTimerStop={(task, preset) => setTimePreset({ ...preset, taskId: task.id })}
              onTasksChanged={syncStatus}
            />
          </>
        ) : null
      }
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
        <>
        <StandardModal visible={!!timePreset} onClose={() => setTimePreset(null)}>
          <TimeEntryForm
            preset={timePreset ? { ...timePreset, projectId: project?.id } : null}
            onCancel={() => setTimePreset(null)}
            onSuccess={() => {
              setTimePreset(null);
              reload();
            }}
          />
        </StandardModal>
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
        </>
      }
    />
  );
};

export default ProjectDetails;
