import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';

export const getStoredToken = () => SecureStore.getItemAsync(AUTH_TOKEN_KEY);

export const setStoredToken = (token: string) =>
  SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

export const clearStoredToken = () => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
