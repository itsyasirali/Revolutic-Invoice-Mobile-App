import { Stack, router, useSegments, useGlobalSearchParams, SplashScreen } from 'expo-router';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import '../global.css';
import CustomSplashScreen from './components/CustomSplashScreen';
import { useAuth } from '../hooks/auth/useAuth';
import { OrganizationProvider, useOrganization } from '../context/OrganizationContext';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

LogBox.ignoreLogs([
  "Couldn't find a navigation context",
  "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?",
  "CssInterop upgrade warning",
  "Converting View to Pressable",
  "setLayoutAnimationEnabledExperimental",
]);

// Keep native splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const segments = useSegments();
  const params = useGlobalSearchParams<{ mode?: string }>();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const loading = authLoading || (user ? orgLoading : false) || !fontsLoaded;

  useEffect(() => {
    // Hide native splash screen as soon as component mounts
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (loading) return;

    const performRouting = () => {
      setIsReady(true);

      const inAuthGroup = segments[0] === 'auth';
      const inScreensGroup = segments[0] === 'screens';
      const isOrgSetup =
        segments[0] === 'screens' && segments[1] === 'organization-setup';
      const atOnboarding =
        segments[0] === undefined || (segments[0] as string) === 'index';
      const isExplicitlyAddingNewOrg = isOrgSetup && params?.mode === 'new';

      if (!user && !inAuthGroup && !atOnboarding) {
        // Not authenticated -> redirect to /auth
        router.replace('/auth');
      } else if (user) {
        const activeOrg = organization || (user as any)?.organization;
        if (!activeOrg) {
          // Authenticated but no organization set up yet
          if (!isOrgSetup) {
            router.replace('/screens/organization-setup' as any);
          }
        } else {
          // Authenticated and has organization
          // If on onboarding, auth, or org-setup without mode=new -> go to Dashboard
          if (!inScreensGroup || inAuthGroup || (isOrgSetup && !isExplicitlyAddingNewOrg)) {
            router.replace('/screens/home');
          }
        }
      }
    };

    if (!isReady) {
      // Small delay for smooth animated splash experience on first launch
      const timer = setTimeout(performRouting, 800);
      return () => clearTimeout(timer);
    } else {
      performRouting();
    }
  }, [user, organization, loading, segments, isReady, params?.mode]);

  // Show custom splash screen while checking authentication and loading fonts
  if (loading || !isReady) {
    return <CustomSplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="screens" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OrganizationProvider>
        <RootLayoutNav />
      </OrganizationProvider>
    </SafeAreaProvider>
  );
}
