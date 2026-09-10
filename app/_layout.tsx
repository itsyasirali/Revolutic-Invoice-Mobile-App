import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import '../global.css';
import CustomSplashScreen from './components/CustomSplashScreen';

LogBox.ignoreLogs([
  "Couldn't find a navigation context",
  'setLayoutAnimationEnabledExperimental',
]);

import { useAuth } from '../hooks/auth/useAuth';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

// Keep native splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const loading = authLoading || !fontsLoaded;

  useEffect(() => {
    // Hide native splash screen as soon as component mounts
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (loading) return;

    // Small delay for smooth animated splash experience
    const timer = setTimeout(() => {
      setIsReady(true);

      const inAuthGroup = segments[0] === 'auth';
      const inScreensGroup = segments[0] === 'screens';
      const atOnboarding = segments[0] === undefined || (segments[0] as string) === 'index';

      if (!user && !inAuthGroup && !atOnboarding) {
        // Not authenticated -> redirect to /auth
        router.replace('/auth');
      } else if (user && (!inScreensGroup || inAuthGroup)) {
        // Authenticated -> redirect to Dashboard (/screens/home)
        router.replace('/screens/home');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [user, loading, segments, router]);

  // Show custom splash screen while checking authentication and loading fonts
  if (loading || !isReady) {
    return <CustomSplashScreen />;
  }

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
