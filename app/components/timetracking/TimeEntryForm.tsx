import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import { useProjectOptions } from '@/hooks/records/useLookups';
import InputField from '../ui/InputField';
import SearchableDropdown, { DropdownOption } from '../ui/SearchableDropdown';
import { FormShell, ToggleRow } from '../records/FormParts';

const today = () => new Date().toISOString().slice(0, 10);
const pad = (n: number) => String(n).padStart(2, '0');
const toHHMM = (minutes: number) => `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
const toMinutes = (hhmm?: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/** Minutes between two HH:mm times (an earlier end means it crossed midnight), like the server. */
const minutesBetween = (start?: string, end?: string) => {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === null || e === null || s === e) return null;
  return e > s ? e - s : e + 1440 - s;
};

/** "1.5", "1:30" or "1h 30m" -> minutes (1 to 23h 59m), else null. */
export const parseHours = (text: string): number | null => {
  const t = text.trim().toLowerCase().replace(',', '.'); // 1,5 is a common way to type 1.5
  if (!t) return null;
  let minutes: number | null = null;
  let m = /^(\d+):([0-5]?\d)$/.exec(t);
  if (m) minutes = Number(m[1]) * 60 + Number(m[2]);
  else if ((m = /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/.exec(t)) && (m[1] || m[2])) minutes = Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
  else if (/^\d*\.?\d+$/.test(t)) minutes = Math.round(parseFloat(t) * 60);
  return minutes !== null && minutes >= 1 && minutes <= 1439 ? minutes : null;
};

const formatHours = (minutes: number | null) => (minutes ? `${Math.floor(minutes / 60)}:${pad(minutes % 60)}` : '');

interface Props {
  entry?: any | null;
  /** Prefill when a task timer is stopped. */
  preset?: { date?: string; startTime?: string; endTime?: string; projectId?: number | string; taskId?: number | string } | null;
  onCancel: () => void;
  onSuccess: () => void;
}

/** Manual time entry: pick the project, then the task, enter the hours and add. */
const TimeEntryForm: React.FC<Props> = ({ entry, preset, onCancel, onSuccess }) => {
  const isEditing = !!entry?.id;
  const { options: projectOptions, projects } = useProjectOptions();

  // Times the entry already has (existing entry or a stopped timer), kept unless the hours change.
  const baseStart: string | undefined = entry?.startTime || preset?.startTime;
  const baseEnd: string | undefined = entry?.endTime || preset?.endTime;
  const baseMinutes = entry?.duration ? Number(entry.duration) : minutesBetween(baseStart, baseEnd);

  const [projectId, setProjectId] = useState<string | number>(entry?.projectId ?? preset?.projectId ?? '');
  const [taskId, setTaskId] = useState<string | number>(entry?.taskId ?? preset?.taskId ?? '');
  const [taskOptions, setTaskOptions] = useState<DropdownOption[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [hours, setHours] = useState(formatHours(baseMinutes));
  const [date, setDate] = useState(String(entry?.date || preset?.date || today()).slice(0, 10));
  const [hourlyRate, setHourlyRate] = useState(entry?.hourlyRate != null ? String(entry.hourlyRate) : '');
  const [billable, setBillable] = useState<boolean>(entry ? !!entry.billable : true);
  const [description, setDescription] = useState(entry?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tasks belong to the chosen project.
  useEffect(() => {
    setTasksLoaded(false);
    if (!projectId) {
      setTaskOptions([]);
      return;
    }
    axios
      .get(`/api/projects/${projectId}`)
      .then((r) => setTaskOptions((r.data?.tasks ?? []).map((t: any) => ({ label: t.name, value: t.id }))))
      .catch(() => setTaskOptions([]))
      .finally(() => setTasksLoaded(true));
  }, [projectId]);

  const pickProject = (o: DropdownOption) => {
    setProjectId(o.value);
    setTaskId('');
    const p = projects.find((x) => String(x.id) === String(o.value));
    if (p?.hourlyRate) setHourlyRate(String(p.hourlyRate));
  };

  const handleSave = async () => {
    if (!projectId) return setError('Select a project');
    if (tasksLoaded && taskOptions.length > 0 && !taskId) return setError('Select a task');
    const minutes = parseHours(hours);
    if (minutes === null) return setError('Enter the hours, e.g. 1.5 or 1:30 (up to 23:59)');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Date must be YYYY-MM-DD');

    // The server stores start and end times. Keep the real ones when the hours are
    // unchanged; otherwise start at 09:00 (or midnight if that would run past 24:00).
    let startTime = baseStart;
    let endTime = baseEnd;
    if (!startTime || !endTime || minutes !== baseMinutes) {
      const startMin = 9 * 60 + minutes < 1440 ? 9 * 60 : 0;
      startTime = toHHMM(startMin);
      endTime = toHHMM(startMin + minutes);
    }

    setSaving(true);
    setError(null);
    try {
      const body = {
        date,
        startTime,
        endTime,
        projectId,
        taskId: taskId || null,
        hourlyRate: hourlyRate === '' ? undefined : Number(hourlyRate),
        billable,
        description,
      };
      if (isEditing) await axios.put(`/api/time-tracking/${entry.id}`, body);
      else await axios.post('/api/time-tracking', body);
      showToast('success', isEditing ? 'Time entry updated' : 'Time entry added');
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save time entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormShell title={isEditing ? 'Edit Time Entry' : 'Add Time Entry'} saving={saving} onCancel={onCancel} onSave={handleSave} error={error}>
      <SearchableDropdown
        label="Project *"
        placeholder="Select Project..."
        searchPlaceholder="Search projects..."
        value={projectId}
        options={projectOptions}
        onSelect={pickProject}
        leftIcon={<Ionicons name="briefcase-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <SearchableDropdown
        label={`Task${tasksLoaded && taskOptions.length > 0 ? ' *' : ''}`}
        placeholder={projectId ? 'Select Task...' : 'Select a project first'}
        searchPlaceholder="Search tasks..."
        value={taskId}
        options={taskOptions}
        onSelect={(o) => setTaskId(o.value)}
        disabled={!projectId}
        clearable
        onClear={() => setTaskId('')}
        emptyMessage="This project has no tasks"
        leftIcon={<Ionicons name="checkbox-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <InputField
        label="Hours *"
        value={hours}
        onChangeText={setHours}
        placeholder="e.g. 1.5 or 1:30"
        keyboardType="numbers-and-punctuation"
        leftIcon={<Ionicons name="time-outline" size={18} color="#1AA3FF" />}
      />
      <InputField label="Date *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
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
