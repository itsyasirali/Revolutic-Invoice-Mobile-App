import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { DeviceEventEmitter } from 'react-native';
import axios from '@/services/api';
import { OrganizationData } from '@/types/organization';
import { showToast } from '@/utils/toast';
import { getStoredToken } from '@/utils/authToken';
import { setStoredActiveOrgId, clearStoredActiveOrgId } from '@/utils/activeOrg';

interface OrganizationContextType {
  organization: OrganizationData | null;
  organizations: OrganizationData[];
  loading: boolean;
  isSwitching: boolean;
  hasOrganization: boolean;
  fetchOrganization: () => Promise<OrganizationData | null>;
  switchOrganization: (orgId: number) => Promise<boolean>;
  refreshOrganizations: () => Promise<void>;
  setOrganization: React.Dispatch<React.SetStateAction<OrganizationData | null>>;
  setOrganizations: React.Dispatch<React.SetStateAction<OrganizationData[]>>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

// ─── In-memory module cache (fast re-mount) ──────────────────────────────────
let cachedOrg: OrganizationData | null = null;
let cachedOrgs: OrganizationData[] = [];
let hasFetchedOrgOnce = false;

export const getCachedOrganization = () => cachedOrg;

export const updateCachedOrganization = (
  org: OrganizationData | null,
  orgs: OrganizationData[] = []
) => {
  cachedOrg = org;
  if (orgs.length > 0) {
    cachedOrgs = orgs;
  } else if (org) {
    cachedOrgs = [org];
  }
  if (org) {
    hasFetchedOrgOnce = true;
  }
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [organization, setOrganization] = useState<OrganizationData | null>(cachedOrg);
  const [organizations, setOrganizations] = useState<OrganizationData[]>(cachedOrgs);
  const [loading, setLoading] = useState<boolean>(!hasFetchedOrgOnce && !cachedOrg);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const fetchOrganization = useCallback(async (): Promise<OrganizationData | null> => {
    try {
      const token = await getStoredToken();
      if (!token) {
        cachedOrg = null;
        cachedOrgs = [];
        hasFetchedOrgOnce = true;
        setOrganization(null);
        setOrganizations([]);
        await clearStoredActiveOrgId();
        return null;
      }

      if (!hasFetchedOrgOnce && !cachedOrg) setLoading(true);
      const res = await axios.get('/api/organizations');
      const org: OrganizationData | null = res.data?.organization ?? null;
      const orgs: OrganizationData[] = res.data?.organizations ?? (org ? [org] : []);

      cachedOrg = org;
      cachedOrgs = orgs;
      hasFetchedOrgOnce = true;

      if (org?.id) {
        await setStoredActiveOrgId(org.id);
      }

      setOrganization(org);
      setOrganizations(orgs);
      return org;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        cachedOrg = null;
        cachedOrgs = [];
        setOrganization(null);
        setOrganizations([]);
        await clearStoredActiveOrgId();
      }
      return cachedOrg;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrganizations = useCallback(async () => {
    await fetchOrganization();
  }, [fetchOrganization]);

  const switchOrganization = useCallback(
    async (orgId: number): Promise<boolean> => {
      try {
        setIsSwitching(true);
        const res = await axios.post('/api/organizations/switch', {
          organizationId: orgId,
        });
        const switchedOrg: OrganizationData | undefined = res.data?.organization;
        if (switchedOrg) {
          cachedOrg = switchedOrg;
          setOrganization(switchedOrg);
          await setStoredActiveOrgId(switchedOrg.id);

          // Re-fetch full list to stay in sync
          await fetchOrganization();

          // Notify other hooks/components that org has changed
          DeviceEventEmitter.emit('org.changed', { orgId: switchedOrg.id });
          showToast('success', `Switched to ${switchedOrg.name}`);
          return true;
        }
        return false;
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to switch organization';
        showToast('error', msg);
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    [fetchOrganization]
  );

  // Initial fetch + listen for org change and auth events
  useEffect(() => {
    fetchOrganization();

    const subOrg = DeviceEventEmitter.addListener('org.refresh', () =>
      fetchOrganization()
    );
    const subAuth = DeviceEventEmitter.addListener(
      'auth.changed',
      (data?: { user?: any; org?: OrganizationData | null }) => {
        if (data?.org) {
          cachedOrg = data.org;
          cachedOrgs = [data.org];
          hasFetchedOrgOnce = true;
          setOrganization(data.org);
          setOrganizations([data.org]);
          if (data.org.id) {
            setStoredActiveOrgId(data.org.id);
          }
          // Silently sync full list in background without losing current active org
          fetchOrganization();
        } else {
          fetchOrganization();
        }
      }
    );
    return () => {
      subOrg.remove();
      subAuth.remove();
    };
  }, [fetchOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        loading,
        isSwitching,
        hasOrganization: !!organization,
        fetchOrganization,
        switchOrganization,
        refreshOrganizations,
        setOrganization,
        setOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export default OrganizationContext;
