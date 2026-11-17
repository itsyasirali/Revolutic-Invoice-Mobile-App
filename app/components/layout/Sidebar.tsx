import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Dimensions, BackHandler, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSidebar } from '@/context/SidebarContext';
import useNotifications from '@/hooks/notifications/useNotifications';

const WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const MAIN: NavItem[] = [
  { label: 'Home', icon: 'home-outline', path: '/screens/home' },
  { label: 'Customers', icon: 'people-outline', path: '/screens/customer/customer' },
  { label: 'Items', icon: 'cube-outline', path: '/screens/Items/items' },
  { label: 'Quotes', icon: 'document-text-outline', path: '/screens/Quotes' },
  { label: 'Invoices', icon: 'receipt-outline', path: '/screens/Invoice/invoices' },
  { label: 'Payments', icon: 'card-outline', path: '/screens/payments' },
  { label: 'Projects', icon: 'briefcase-outline', path: '/screens/Projects' },
  { label: 'Expenses', icon: 'wallet-outline', path: '/screens/Expenses' },
  { label: 'Time Tracking', icon: 'time-outline', path: '/screens/TimeTracking' },
  { label: 'Reports', icon: 'bar-chart-outline', path: '/screens/Reports' },
];

const OTHER: NavItem[] = [
  { label: 'Notifications', icon: 'notifications-outline', path: '/screens/Notifications' },
  { label: 'Organizations', icon: 'business-outline', path: '/screens/organization' },
  { label: 'Settings', icon: 'settings-outline', path: '/screens/settings' },
];

const Sidebar: React.FC = () => {
  const { open, closeSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  const progress = useRef(new Animated.Value(0)).current;

  // The panel stays mounted (just off-screen) so opening never has to build
  // the menu while animating. Native-driver animation keeps it at 60fps.
  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 280 : 220,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  // Android back closes the sidebar first.
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSidebar();
      return true;
    });
    return () => sub.remove();
  }, [open, closeSidebar]);

  const isActive = (path: string) =>
    path === '/screens/home'
      ? pathname === path
      : path === '/screens/settings'
        ? pathname === path || pathname === '/screens/settings/profile' || pathname === '/screens/settings/password'
        : pathname === path || pathname.startsWith(path);

  const go = (path: string) => {
    closeSidebar();
    // Navigate once the close animation has finished so the two never compete.
    if (pathname !== path) setTimeout(() => router.replace(path as any), 230);
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.path);
    return (
      <Pressable
        key={item.path}
        onPress={() => go(item.path)}
        className={`flex-row items-center px-3 py-3 rounded-md mb-1 ${active ? 'bg-primary' : 'active:bg-slate-100'}`}
      >
        <Ionicons name={item.icon} size={20} color={active ? '#ffffff' : '#64748b'} />
        <Text className={`ml-3 text-[15px] ${active ? 'font-bold text-white' : 'font-medium text-slate-700'}`}>
          {item.label}
        </Text>
        {item.path === '/screens/Notifications' && unreadCount > 0 && (
          <View className={`ml-auto min-w-[22px] h-[22px] px-1.5 rounded-full items-center justify-center ${active ? 'bg-white' : 'bg-red-500'}`}>
            <Text className={`text-[11px] font-bold ${active ? 'text-primary' : 'text-white'}`}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="absolute inset-0" style={{ zIndex: 50, elevation: 50 }} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View
        className="absolute inset-0 bg-black/40"
        style={{ opacity: progress }}
      >
        <Pressable className="flex-1" onPress={closeSidebar} />
      </Animated.View>

      <Animated.View
        className="absolute top-0 bottom-0 left-0 bg-white shadow-xl"
        style={{
          width: WIDTH,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
          transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-WIDTH - 24, 0] }) }],
        }}
      >
        <ScrollView className="flex-1 px-3 pt-3" showsVerticalScrollIndicator={false}>
          {MAIN.map(renderItem)}
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">More</Text>
          {OTHER.map(renderItem)}
        </ScrollView>

      </Animated.View>
    </View>
  );
};

export default Sidebar;
