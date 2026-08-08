import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import '../global.css';

LogBox.ignoreLogs([
  "Couldn't find a navigation context",
  'setLayoutAnimationEnabledExperimental',
]);

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
    const atOnboarding = segments[0] === undefined;


    if (!user && !inAuthGroup && !atOnboarding) {
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
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="screens" />
      </Stack>
    </SafeAreaProvider>
  );
}
