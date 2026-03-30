import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "react-native-drawer-layout";
import menuItems from "@/data/menuItems";
import { useRouter, usePathname } from "expo-router";
import Header from "./header";
import { useProfile } from "@/hooks/auth/useProfile";

import { useLogout } from "@/hooks/auth/useLogout";

interface SidebarProps {
  subtitle: string;
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarProps> = ({ subtitle, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useLogout();
  const { user } = useProfile();

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleNavigate = (path: string, isLogout?: boolean) => {
    closeDrawer();
    if (isLogout) {
      logout();
    } else {
      router.push(path as any);
    }
  };

  const isActiveRoute = (itemPath: string) => {
    return pathname === itemPath || pathname.startsWith(itemPath + '/');
  };

  const renderDrawerContent = useCallback(
    () => {
      const getInitials = (name?: string) => {
        return name ? name.charAt(0).toUpperCase() : "U";
      };

      const displayName = user?.name || "Personal";
      const displayEmail = user?.email || "";
      const profileName = user?.name || user?.firstName || "User";

      return (
        <View className="flex-1 bg-white">
          {/* Profile Header */}
          <View className="pt-12 pb-6 px-6 bg-white border-b border-slate-200">
            <View className="flex-row items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <Text className="text-4xl font-bold text-primary">
                  {getInitials(profileName)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-slate-800 mb-1">
                  {displayName}
                </Text>
                <Text className="text-sm text-slate-500">
                  {displayEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="flex-1 py-2">
            {menuItems.map((item, index) => {
              const isActive = isActiveRoute(item.path);
              return (
                <Pressable
                  key={index}
                  className={`flex-row items-center px-6 py-4 mb-0.5 ${isActive ? 'bg-primary' : 'bg-transparent'}`}
                  onPress={() => handleNavigate(item.path, (item as any).isLogout)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={isActive ? "#ffffff" : "#1e293b"}
                  />
                  <Text className={`text-base font-medium ml-4 ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    },
    [closeDrawer, pathname, user] // Depend on user
  );

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      drawerType="front"
      drawerPosition="left"
      drawerStyle={styles.drawerStyle}
      overlayStyle={styles.overlayStyle}
      renderDrawerContent={renderDrawerContent}
    >
      <View style={styles.container}>
        <Header subtitle={subtitle} onMenuPress={openDrawer} />
        <View style={styles.content}>{children}</View>
      </View>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
  },
  // sidebarContent removed
  drawerStyle: {
    width: 280,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 16,
  },
  overlayStyle: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default SidebarLayout;
