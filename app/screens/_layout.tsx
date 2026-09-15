import React, { useEffect } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { View, BackHandler } from 'react-native';
import BottomNav from '../components/layout/BottomNav';

const TAB_LIST_PATHS = [
  '/screens/customer/customer',
  '/screens/customer',
  '/screens/Items/items',
  '/screens/Items',
  '/screens/Invoice/invoices',
  '/screens/Invoice',
  '/screens/payments',
];

export default function ScreensLayout() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onBackPress = () => {
      // 1. If we are on Home/Dashboard, allow default Android back behavior (exit app)
      if (pathname === '/screens/home') {
        return false;
      }

      // 2. If on any main tab list screen, return to Home/Dashboard
      if (TAB_LIST_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'))) {
        router.replace('/screens/home');
        return true;
      }

      // 3. If on organization setup, allow back navigation or let system exit
      if (pathname.includes('/organization-setup')) {
        if (router.canGoBack()) {
          router.back();
          return true;
        }
        return false;
      }

      // 4. For detail or sub-screens, go back in stack if possible
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      // 5. Fallback: navigate to Home
      router.replace('/screens/home');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [pathname, router]);

  const hideBottomNav = pathname.includes('/organization-setup');

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" />
          <Stack.Screen name="payments" />
          <Stack.Screen name="Invoice" />
          <Stack.Screen name="Items" />
          <Stack.Screen name="customer" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="organization-setup" />
        </Stack>
      </View>
      {!hideBottomNav && <BottomNav />}
    </View>
  );
}
