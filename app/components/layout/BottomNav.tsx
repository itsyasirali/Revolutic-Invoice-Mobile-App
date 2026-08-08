import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', path: '/screens/home' },
  { key: 'customers', label: 'Customers', icon: 'people-outline', path: '/screens/customer/customer' },
  { key: 'items', label: 'Items', icon: 'bag-handle-outline', path: '/screens/Items/items' },
  { key: 'invoices', label: 'Invoices', icon: 'receipt-outline', path: '/screens/Invoice/invoices' },
  { key: 'payments', label: 'Payments', icon: 'cash-outline', path: '/screens/payments' },
];

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-t border-gray-100 px-4 pt-3 flex-row justify-around items-center shadow-lg"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.path as any)}
            className="items-center justify-center gap-1"
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? '#1AA3FF' : '#9CA3AF'}
            />
            <Text
              className={`text-[11px] ${
                isActive ? 'font-bold text-primary' : 'font-medium text-gray-400'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomNav;
