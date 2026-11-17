import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import { useCustomerOptions, useProjectOptions } from '@/hooks/records/useLookups';
import InputField from '../ui/InputField';
import SearchableDropdown, { DropdownOption } from '../ui/SearchableDropdown';
import { FormShell, ToggleRow } from '../records/FormParts';

const today = () => new Date().toISOString().slice(0, 10);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

interface Props {
  entry?: any | null;
  /** Prefill from the timer when it is stopped. */
  preset?: { date?: string; startTime?: string; endTime?: string; projectId?: number | string } | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const TimeEntryForm: React.FC<Props> = ({ entry, preset, onCancel, onSuccess }) => {
  const isEditing = !!entry?.id;
  const { options: customerOptions } = useCustomerOptions();
  const { options: projectOptions, projects } = useProjectOptions();

  const [date, setDate] = useState(String(entry?.date || preset?.date || today()).slice(0, 10));
  const [startTime, setStartTime] = useState(entry?.startTime || preset?.startTime || '');
  const [endTime, setEndTime] = useState(entry?.endTime || preset?.endTime || '');
  const [customerId, setCustomerId] = useState<string | number>(entry?.customerId ?? '');
  const [projectId, setProjectId] = useState<string | number>(entry?.projectId ?? preset?.projectId ?? '');
  const [taskId, setTaskId] = useState<string | number>(entry?.taskId ?? '');
  const [taskOptions, setTaskOptions] = useState<DropdownOption[]>([]);
  const [hourlyRate, setHourlyRate] = useState(entry?.hourlyRate != null ? String(entry.hourlyRate) : '');
  const [billable, setBillable] = useState<boolean>(entry ? !!entry.billable : true);
  const [description, setDescription] = useState(entry?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tasks belong to the chosen project.
  useEffect(() => {
    if (!projectId) {
      setTaskOptions([]);
      return;
    }
    axios
      .get(`/api/projects/${projectId}`)
      .then((r) => setTaskOptions((r.data?.tasks ?? []).map((t: any) => ({ label: t.name, value: t.id }))))
      .catch(() => setTaskOptions([]));
  }, [projectId]);

  const pickProject = (o: DropdownOption) => {
    setProjectId(o.value);
    setTaskId('');
    const p = projects.find((x) => String(x.id) === String(o.value));
    if (p) {
      if (!hourlyRate && p.hourlyRate) setHourlyRate(String(p.hourlyRate));
      setCustomerId(p.customerId ?? '');
    }
  };

  const handleSave = async () => {
    if (!HHMM.test(startTime) || !HHMM.test(endTime)) return setError('Times must be in HH:mm format (e.g. 09:30)');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Date must be YYYY-MM-DD');
    if (billable && !customerId && !projectId) return setError('Choose a customer or project for billable time');
    setSaving(true);
    setError(null);
    try {
      const project = projects.find((p) => String(p.id) === String(projectId));
      const body = {
        date,
        startTime,
        endTime,
        customerId: project?.customerId ?? (customerId || null),
        projectId: projectId || null,
        taskId: taskId || null,
        hourlyRate: hourlyRate === '' ? undefined : Number(hourlyRate),
        billable,
        description,
      };
      if (isEditing) await axios.put(`/api/time-tracking/${entry.id}`, body);
      else await axios.post('/api/time-tracking', body);
      showToast('success', isEditing ? 'Time entry updated' : 'Time entry created');
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save time entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormShell title={isEditing ? 'Edit Time Entry' : 'Add Time Entry'} saving={saving} onCancel={onCancel} onSave={handleSave} error={error}>
      <InputField label="Date *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField label="Start *" value={startTime} onChangeText={setStartTime} placeholder="09:00" maxLength={5} />
        </View>
        <View className="flex-1">
          <InputField label="End *" value={endTime} onChangeText={setEndTime} placeholder="17:30" maxLength={5} />
        </View>
      </View>
      <SearchableDropdown
        label="Project"
        placeholder="Select Project..."
        searchPlaceholder="Search projects..."
        value={projectId}
        options={projectOptions}
        onSelect={pickProject}
        clearable
        onClear={() => {
          setProjectId('');
          setTaskId('');
        }}
        leftIcon={<Ionicons name="briefcase-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      {!!projectId && (
        <SearchableDropdown
          label="Task"
          placeholder="Select Task..."
          searchPlaceholder="Search tasks..."
          value={taskId}
          options={taskOptions}
          onSelect={(o) => setTaskId(o.value)}
          clearable
          onClear={() => setTaskId('')}
          emptyMessage="This project has no tasks"
          leftIcon={<Ionicons name="checkbox-outline" size={18} color="#1AA3FF" />}
          containerStyle="mb-5"
        />
      )}
      {!projectId && (
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
      )}
      <InputField label="Hourly Rate" value={hourlyRate} onChangeText={setHourlyRate} placeholder="Defaults to the project rate" keyboardType="numeric" />
      <ToggleRow label="Billable" value={billable} onChange={setBillable} />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What did you work on?"
        multiline
        numberOfLines={3}
        inputStyle="text-slate-800 text-base flex-1 h-20"
        textAlignVertical="top"
      />
    </FormShell>
  );
};

export default TimeEntryForm;
