import { useState, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import axios from '@/services/api';
import { useOrganization, updateCachedOrganization } from '@/context/OrganizationContext';
import { setStoredActiveOrgId } from '@/utils/activeOrg';
import { getCachedUser } from '@/hooks/auth/useProfile';
import { showToast } from '@/utils/toast';
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
}

export const useOrganizationForm = (
  onCancel?: () => void,
  onSuccess?: () => void
): UseOrganizationFormReturn => {
  const { setOrganization, refreshOrganizations } = useOrganization();

  // ── Form State ───────────────────────────────────────────────────────────────
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [provincesList, setProvincesList] = useState<string[]>(() =>
    getStatesForCountry(LOCATIONS[0])
  );
  const [province, setProvince] = useState<string>(() => {
    const states = getStatesForCountry(LOCATIONS[0]);
    return states[0] || '';
  });
  const [currency, setCurrency] = useState<string>(() =>
    getCurrencyForCountry(LOCATIONS[0])
  );
  const [timeZone, setTimeZone] = useState<string>(() =>
    getTimezoneForCountry(LOCATIONS[0])
  );

  // ── Address Fields ───────────────────────────────────────────────────────────
  const [showAddress, setShowAddress] = useState(false);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

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
        err?.response?.data?.message || 'Failed to create organization. Please try again.'
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
  };
};

export default useOrganizationForm;
