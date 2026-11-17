import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import { useCustomerOptions } from '@/hooks/records/useLookups';
import InputField from '../ui/InputField';
import SearchableDropdown from '../ui/SearchableDropdown';
import { FormShell, ChipSelect } from '../records/FormParts';

const STATUSES = ['Active', 'On Hold', 'Completed'] as const;
const BILLING = ['Hourly', 'Fixed'] as const;

interface Props {
  project?: any | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProjectForm: React.FC<Props> = ({ project, onCancel, onSuccess }) => {
  const isEditing = !!project?.id;
  const { customers, options } = useCustomerOptions();
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [customerId, setCustomerId] = useState<string | number>(project?.customerId ?? '');
  const [status, setStatus] = useState<string>(project?.status || 'Active');
  const [billingMethod, setBillingMethod] = useState<string>(project?.billingMethod || 'Hourly');
  const [hourlyRate, setHourlyRate] = useState(String(project?.hourlyRate ?? ''));
  const [fixedAmount, setFixedAmount] = useState(String(project?.fixedAmount ?? ''));
  const [budgetHours, setBudgetHours] = useState(String(project?.budgetHours ?? ''));
  const [budgetAmount, setBudgetAmount] = useState(String(project?.budgetAmount ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return setError('Project name is required');
    if (!customerId) return setError('Select a customer');
    setSaving(true);
    setError(null);
    try {
      const customer = customers.find((c: any) => String(c.id) === String(customerId));
      const body = {
        name: name.trim(),
        description,
        customerId: Number(customerId),
        status,
        billingMethod,
        hourlyRate: Number(hourlyRate) || 0,
        fixedAmount: Number(fixedAmount) || 0,
        budgetHours: Number(budgetHours) || 0,
        budgetAmount: Number(budgetAmount) || 0,
        currency: project?.currency || customer?.currency || undefined,
      };
      if (isEditing) await axios.put(`/api/projects/${project.id}`, body);
      else await axios.post('/api/projects', body);
      showToast('success', isEditing ? 'Project updated' : 'Project created');
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormShell title={isEditing ? 'Edit Project' : 'Add Project'} saving={saving} onCancel={onCancel} onSave={handleSave} error={error}>
      <InputField label="Project Name *" value={name} onChangeText={setName} placeholder="Enter project name" />
      <SearchableDropdown
        label="Customer *"
        placeholder="Select Customer..."
        searchPlaceholder="Search customers..."
        value={customerId}
        options={options}
        onSelect={(o) => setCustomerId(o.value)}
        leftIcon={<Ionicons name="person-outline" size={18} color="#1AA3FF" />}
        containerStyle="mb-5"
      />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        numberOfLines={3}
        inputStyle="text-slate-800 text-base flex-1 h-24"
        textAlignVertical="top"
      />
      <ChipSelect label="Status" options={STATUSES} value={status} onChange={setStatus} />
      <ChipSelect label="Billing Method" options={BILLING} value={billingMethod} onChange={setBillingMethod} />
      {billingMethod === 'Hourly' ? (
        <InputField label="Hourly Rate" value={hourlyRate} onChangeText={setHourlyRate} placeholder="0.00" keyboardType="numeric" />
      ) : (
        <InputField label="Fixed Amount" value={fixedAmount} onChangeText={setFixedAmount} placeholder="0.00" keyboardType="numeric" />
      )}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField label="Budget Hours" value={budgetHours} onChangeText={setBudgetHours} placeholder="0" keyboardType="numeric" />
        </View>
        <View className="flex-1">
          <InputField label="Budget Amount" value={budgetAmount} onChangeText={setBudgetAmount} placeholder="0.00" keyboardType="numeric" />
        </View>
      </View>
    </FormShell>
  );
};

export default ProjectForm;
