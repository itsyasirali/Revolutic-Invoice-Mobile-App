import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';

// Kept in memory too, so the session still works for this run if the native
// secure store throws (e.g. an app binary built with a different expo-secure-store).
let memoryToken: string | null = null;

export const getStoredToken = async (): Promise<string | null> => {
  if (memoryToken) return memoryToken;
  try {
    const stored = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (stored) memoryToken = stored;
    return stored;
  } catch {
    return null;
  }
};

export const setStoredToken = async (token: string): Promise<void> => {
  memoryToken = token;
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch {
    // secure store unavailable: memory copy keeps this session alive
  }
};

export const clearStoredToken = async (): Promise<void> => {
  memoryToken = null;
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
};
