import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "home", path: "/screens/home" },
  {
    key: "customers",
    label: "Customers",
    icon: "people-outline",
    path: "/screens/customer/customer",
  },
  {
    key: "items",
    label: "Items",
    icon: "cube-outline",
    path: "/screens/Items/items",
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: "document-text-outline",
    path: "/screens/Invoice/invoices",
  },
  {
    key: "payments",
    label: "Payments",
    icon: "card-outline",
    path: "/screens/payments",
  },
];

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-t border-slate-100 px-3 pt-2.5 flex-row justify-around items-center shadow-lg"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path !== "/screens/home" && pathname.startsWith(item.path));
        return (
          <Pressable
            key={item.key}
            onPress={() => {
              if (pathname !== item.path) {
                router.replace(item.path as any);
              }
            }}
            className="items-center justify-center min-w-[56px]"
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? "#1AA3FF" : "#94a3b8"}
            />
            <Text
              style={isActive ? { color: "#1AA3FF" } : undefined}
              className={`text-[11px] mt-0.5 ${
                isActive ? "font-bold" : "font-medium text-slate-500"
              }`}
            >
              {item.label}
            </Text>
            {isActive ? (
              <View
                style={{ backgroundColor: "#1AA3FF" }}
                className="w-5 h-1 rounded-full mt-1"
              />
            ) : (
              <View className="w-5 h-1 mt-1 opacity-0" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomNav;
