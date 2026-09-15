import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import axios from '@/services/api';
import { clearStoredToken } from '@/utils/authToken';
import { updateCachedUser, getCachedUser } from '@/hooks/auth/useProfile';
import { useOrganization, updateCachedOrganization } from '@/context/OrganizationContext';
import { showToast } from '@/utils/toast';
import { setStoredActiveOrgId } from '@/utils/activeOrg';
import {
  INDUSTRIES,
  LOCATIONS,
  getStatesForCountry,
  getTimezoneForCountry,
  getCurrencyForCountry,
} from '@/data/organizationSetupData';

export interface UseOrganizationSetupReturn {
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
  isAddingNewOrg: boolean;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export const useOrganizationSetup = (): UseOrganizationSetupReturn => {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { hasOrganization, refreshOrganizations, setOrganization } = useOrganization();

  const isAddingNewOrg = hasOrganization || mode === 'new';

  // If user already has an active organization and didn't explicitly request to add a new one, go to Home
  useEffect(() => {
    if (hasOrganization && mode !== 'new') {
      router.replace('/screens/home');
    }
  }, [hasOrganization, mode, router]);

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

  // ── Optional Address ─────────────────────────────────────────────────────────
  const [showAddress, setShowAddress] = useState(false);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Location change → auto-fill currency, states, timezone ──────────────────
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

  // ── Submit ───────────────────────────────────────────────────────────────────
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
      // Emit refresh events so the root layout and profile re-check org state
      DeviceEventEmitter.emit('org.refresh');
      DeviceEventEmitter.emit('auth.changed', { user: currentUser, org: savedOrg });

      showToast(
        'success',
        isAddingNewOrg
          ? `Organization "${organizationName}" created!`
          : `${organizationName} setup complete!`
      );

      router.replace('/screens/home');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to set up organization. Please try again.'
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
    isAddingNewOrg,
    setOrganization,
    refreshOrganizations,
    router,
  ]);

  // ── Back ─────────────────────────────────────────────────────────────────────
  const handleBack = useCallback(async () => {
    if (isAddingNewOrg) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/screens/home');
      }
    } else {
      // First-time setup — logout
      await clearStoredToken();
      updateCachedUser(null);
      DeviceEventEmitter.emit('auth.changed');
      router.replace('/auth');
    }
  }, [isAddingNewOrg, router]);

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
    isAddingNewOrg,
    handleSubmit,
    handleBack,
  };
};

export default useOrganizationSetup;
