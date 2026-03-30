import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import '../global.css';

import { useAuth } from '../hooks/auth/useAuth';
import {
  useFonts,
  Roboto_100Thin,
  Roboto_100Thin_Italic,
  Roboto_300Light,
  Roboto_300Light_Italic,
  Roboto_400Regular,
  Roboto_400Regular_Italic,
  Roboto_500Medium,
  Roboto_500Medium_Italic,
  Roboto_700Bold,
  Roboto_700Bold_Italic,
  Roboto_900Black,
  Roboto_900Black_Italic,
} from '@expo-google-fonts/roboto';

// Keep splash up until we know auth state
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Roboto_100Thin,
    Roboto_100Thin_Italic,
    Roboto_300Light,
    Roboto_300Light_Italic,
    Roboto_400Regular,
    Roboto_400Regular_Italic,
    Roboto_500Medium,
    Roboto_500Medium_Italic,
    Roboto_700Bold,
    Roboto_700Bold_Italic,
    Roboto_900Black,
    Roboto_900Black_Italic,
  });

  const loading = authLoading || !fontsLoaded;

  useEffect(() => {
    if (loading) return;

    SplashScreen.hideAsync().catch(() => { });

    const inAuthGroup = segments[0] === 'auth';
    const inScreensGroup = segments[0] === 'screens';

    // Startup Permissions Request
    if (Platform.OS === 'android') {
      const requestAllPermissions = async () => {
        try {
          const permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          ];

          const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);

          // Check if storage is denied
          const resultsTyped = results as Record<string, string>;
          const writeStatus = resultsTyped[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE];
          const readStatus = resultsTyped[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];

          if (writeStatus === 'denied' || readStatus === 'denied' || writeStatus === 'never_ask_again' || readStatus === 'never_ask_again') {
            Alert.alert(
              "Enable Memory Access",
              "This app needs storage access to save invoice PDFs. Please allow storage permissions to use the download feature.",
              [{ text: "OK" }]
            );
          }
        } catch (err) {
          console.warn('Startup permission error:', err);
        }
      };
      requestAllPermissions();
    }

    if (!user && !inAuthGroup) {
      router.replace('/auth');
    } else if (user && inAuthGroup) {
      router.replace('/screens/home');
    } else if (user && !inScreensGroup && !inAuthGroup) {
      router.replace('/screens/home');
    }
  }, [user, loading, segments, router]);

  // While loading, keep rendering nothing (splash is visible)
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="screens" />
    </Stack>
  );
}
