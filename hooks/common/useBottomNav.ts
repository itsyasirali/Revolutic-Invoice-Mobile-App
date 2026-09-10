import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface NavItemConfig {
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    path: string;
    isActive: boolean;
}

const BASE_NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: "home" as const, path: "/screens/home" },
    {
        key: "customers",
        label: "Customers",
        icon: "people-outline" as const,
        path: "/screens/customer/customer",
    },
    {
        key: "items",
        label: "Items",
        icon: "cube-outline" as const,
        path: "/screens/Items/items",
    },
    {
        key: "invoices",
        label: "Invoices",
        icon: "document-text-outline" as const,
        path: "/screens/Invoice/invoices",
    },
    {
        key: "payments",
        label: "Payments",
        icon: "card-outline" as const,
        path: "/screens/payments",
    },
];

export const useBottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const navItems: NavItemConfig[] = BASE_NAV_ITEMS.map((item) => {
        const isActive =
            pathname === item.path ||
            (item.path !== "/screens/home" && pathname.startsWith(item.path));

        return {
            ...item,
            isActive,
        };
    });

    const handleNavItemPress = (item: NavItemConfig) => {
        if (pathname !== item.path) {
            router.replace(item.path as any);
        }
    };

    return {
        navItems,
        insets,
        handleNavItemPress,
    };
};
