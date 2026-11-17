import { useState, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import axios from '@/services/api';
import { useOrganization, updateCachedOrganization } from '@/context/OrganizationContext';
import { setStoredActiveOrgId } from '@/utils/activeOrg';
import { getCachedUser } from '@/hooks/auth/useProfile';
import { showToast } from '@/utils/toast';
import type { OrganizationData } from '@/types/organization';
import {
  INDUSTRIES,
  LOCATIONS,
  CURRENCIES,
  getStatesForCountry,
  getTimezoneForCountry,
  getCurrencyForCountry,
} from '@/data/organizationSetupData';

export type ActivePickerType =
  | 'industry'
  | 'location'
  | 'province'
  | 'currency'
  | 'timezone'
  | null;

export interface UseOrganizationFormReturn {
  organizationName: string;
  setOrganizationName: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  location: string;
  handleLocationChange: (val: string) => void;
  province: string;
  setProvince: (val: string) => void;
  provincesList: string[];
  currency: string;
  setCurrency: (val: string) => void;
  currencyLabel: string;
  timeZone: string;
  setTimeZone: (val: string) => void;
  showAddress: boolean;
  setShowAddress: (val: boolean) => void;
  streetAddress: string;
  setStreetAddress: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  zipCode: string;
  setZipCode: (val: string) => void;
  loading: boolean;
  error: string | null;
  activePicker: ActivePickerType;
  setActivePicker: (val: ActivePickerType) => void;
  handleSubmit: () => Promise<void>;
  isEditing: boolean;
}

export const useOrganizationForm = (
  onCancel?: () => void,
  onSuccess?: () => void,
  editing?: OrganizationData | null
): UseOrganizationFormReturn => {
  const { organization: activeOrg, setOrganization, refreshOrganizations } = useOrganization();
  const isEditing = !!editing?.id;
  const initialLocation = editing?.businessLocation || LOCATIONS[0];

  // ── Form State ───────────────────────────────────────────────────────────────
  const [organizationName, setOrganizationName] = useState(editing?.name || '');
  const [industry, setIndustry] = useState(editing?.industry || INDUSTRIES[0]);
  const [location, setLocation] = useState(initialLocation);
  const [provincesList, setProvincesList] = useState<string[]>(() =>
    getStatesForCountry(initialLocation)
  );
  const [province, setProvince] = useState<string>(() => {
    if (editing?.stateProvince) return editing.stateProvince;
    const states = getStatesForCountry(initialLocation);
    return states[0] || '';
  });
  const [currency, setCurrency] = useState<string>(() =>
    editing?.currency || getCurrencyForCountry(initialLocation)
  );
  const [timeZone, setTimeZone] = useState<string>(() =>
    editing?.timeZone || getTimezoneForCountry(initialLocation)
  );

  // ── Address Fields ───────────────────────────────────────────────────────────
  const [showAddress, setShowAddress] = useState(!!(editing?.streetAddress || editing?.city || editing?.zipCode));
  const [streetAddress, setStreetAddress] = useState(editing?.streetAddress || '');
  const [city, setCity] = useState(editing?.city || '');
  const [zipCode, setZipCode] = useState(editing?.zipCode || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Picker Modal State ───────────────────────────────────────────────────────
  const [activePicker, setActivePicker] = useState<ActivePickerType>(null);

  const currencyLabel =
    CURRENCIES.find((c) => c.value === currency)?.label || currency;

  // ── Location Change Handler ──────────────────────────────────────────────────
  const handleLocationChange = useCallback((newLocation: string) => {
    setLocation(newLocation);

    const autoCurrency = getCurrencyForCountry(newLocation);
    if (autoCurrency) setCurrency(autoCurrency);

    const newStates = getStatesForCountry(newLocation);
    setProvincesList(newStates);
    setProvince(newStates[0] || '');

    const autoTimezone = getTimezoneForCountry(newLocation);
    if (autoTimezone) setTimeZone(autoTimezone);
  }, []);

  // ── Submit Handler ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!organizationName.trim()) {
      setError('Organization Name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullAddress = showAddress
        ? [streetAddress, city, province, location, zipCode]
            .filter(Boolean)
            .join(', ')
        : location;

      if (isEditing && editing) {
        const res = await axios.put(`/api/organizations/${editing.id}`, {
          name: organizationName.trim(),
          industry,
          currency,
          address: fullAddress || undefined,
          businessLocation: location,
          stateProvince: province || undefined,
          streetAddress: showAddress ? streetAddress : '',
          city: showAddress ? city : '',
          zipCode: showAddress ? zipCode : '',
          timeZone,
        });
        const updated = res.data?.organization;
        if (updated && activeOrg?.id === updated.id) {
          updateCachedOrganization(updated);
          setOrganization(updated);
        }
        await refreshOrganizations();
        DeviceEventEmitter.emit('org.refresh');
        showToast('success', 'Organization updated');
        if (onSuccess) onSuccess();
        else if (onCancel) onCancel();
        return;
      }

      const response = await axios.post('/api/organizations', {
        name: organizationName.trim(),
        industry,
        currency,
        address: fullAddress || undefined,
        businessLocation: location,
        stateProvince: province || undefined,
        language: 'English',
        timeZone,
      });

      const savedOrg = response.data?.organization;
      if (savedOrg) {
        await setStoredActiveOrgId(savedOrg.id);
        updateCachedOrganization(savedOrg);
        setOrganization(savedOrg);
      }

      await refreshOrganizations();

      const currentUser = getCachedUser();
      DeviceEventEmitter.emit('org.refresh');
      DeviceEventEmitter.emit('auth.changed', { user: currentUser, org: savedOrg });

      showToast('success', `Organization "${organizationName}" created!`);

      if (onSuccess) {
        onSuccess();
      } else if (onCancel) {
        onCancel();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || isEditing ? 'Failed to update organization. Please try again.' : 'Failed to create organization. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    organizationName,
    showAddress,
    streetAddress,
    city,
    province,
    location,
    zipCode,
    industry,
    currency,
    timeZone,
    isEditing,
    editing,
    activeOrg,
    setOrganization,
    refreshOrganizations,
    onSuccess,
    onCancel,
  ]);

  return {
    organizationName,
    setOrganizationName,
    industry,
    setIndustry,
    location,
    handleLocationChange,
    province,
    setProvince,
    provincesList,
    currency,
    setCurrency,
    currencyLabel,
    timeZone,
    setTimeZone,
    showAddress,
    setShowAddress,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    zipCode,
    setZipCode,
    loading,
    error,
    activePicker,
    setActivePicker,
    handleSubmit,
    isEditing,
  };
};

export default useOrganizationForm;
