import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useOrganization, getCachedOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/hooks/auth/useAuth';
import { OrganizationData } from '@/types/organization';

export interface UseOrganizationSwitcherReturn {
  organization: OrganizationData | null;
  organizations: OrganizationData[];
  isSwitching: boolean;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  handleSelectOrg: (orgId: number) => Promise<void>;
  handleAddNewOrg: () => void;
}

const useOrganizationSwitcher = (): UseOrganizationSwitcherReturn => {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, organizations, isSwitching, switchOrganization } =
    useOrganization();

  const [isOpen, setIsOpen] = useState(false);

  // Resolve active org: context state > cached module state > user embedded organization
  const activeOrg: OrganizationData | null =
    organization ||
    getCachedOrganization() ||
    ((user as any)?.organization as OrganizationData | undefined) ||
    null;

  const activeOrgs: OrganizationData[] =
    organizations.length > 0
      ? organizations
      : activeOrg
        ? [activeOrg]
        : [];

  const handleSelectOrg = useCallback(
    async (orgId: number) => {
      if (orgId === activeOrg?.id || isSwitching) {
        setIsOpen(false);
        return;
      }
      setIsOpen(false);
      await switchOrganization(orgId);
    },
    [activeOrg?.id, isSwitching, switchOrganization]
  );

  const handleAddNewOrg = useCallback(() => {
    setIsOpen(false);
    router.push({
      pathname: '/screens/organization-setup' as any,
      params: { mode: 'new' },
    });
  }, [router]);

  return {
    organization: activeOrg,
    organizations: activeOrgs,
    isSwitching,
    isOpen,
    setIsOpen,
    handleSelectOrg,
    handleAddNewOrg,
  };
};

export default useOrganizationSwitcher;
