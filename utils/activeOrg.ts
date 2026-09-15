import * as SecureStore from 'expo-secure-store';

const ACTIVE_ORG_KEY = 'active_org_id';

let memoryActiveOrgId: string | null = null;

export const getStoredActiveOrgId = async (): Promise<string | null> => {
  if (memoryActiveOrgId) return memoryActiveOrgId;
  try {
    const stored = await SecureStore.getItemAsync(ACTIVE_ORG_KEY);
    if (stored) memoryActiveOrgId = stored;
    return stored;
  } catch {
    return null;
  }
};

export const setStoredActiveOrgId = async (orgId: number | string): Promise<void> => {
  const strId = String(orgId);
  memoryActiveOrgId = strId;
  try {
    await SecureStore.setItemAsync(ACTIVE_ORG_KEY, strId);
  } catch {
    // secure store error fallback
  }
};

export const clearStoredActiveOrgId = async (): Promise<void> => {
  memoryActiveOrgId = null;
  try {
    await SecureStore.deleteItemAsync(ACTIVE_ORG_KEY);
  } catch {
    // secure store error fallback
  }
};
