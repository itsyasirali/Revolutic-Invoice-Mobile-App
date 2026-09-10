import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "@/hooks/auth/useProfile";

interface DashboardHeaderProps {
  userName?: string;
  unreadCount?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName: customUserName,
  unreadCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useProfile();

  const userName =
    customUserName ||
    user?.firstName ||
    (user?.name ? user.name.split(" ")[0] : "User");

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good morning,";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon,";
    } else if (hour >= 17 && hour < 21) {
      return "Good evening,";
    } else {
      return "Good night,";
    }
  }, []);

  return (
    <View
      className="px-4 pb-2 bg-slate-50"
      style={{ paddingTop: insets.top + 3 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-slate-500 text-xs font-medium">
            {greeting}
          </Text>
          <Text className="text-slate-800 text-2xl font-bold tracking-tight">
            {userName}
          </Text>
          <Text className="text-slate-400 text-xs font-normal mt-0.5">
            Here{"'"}s your business overview
          </Text>
        </View>

        {/* Right Action Buttons */}
        <View className="flex-row items-center gap-2">
          {/* Notification Bell */}
          <Pressable
            onPress={() => router.push("/screens/settings")}
            className="w-10 h-10 rounded-full bg-white items-center justify-center relative border border-slate-200 shadow-sm active:bg-slate-100"
          >
            <Ionicons name="notifications-outline" size={20} color="#334155" />
            {unreadCount > 0 && (
              <View className="w-[18px] h-[18px] rounded-full bg-red-500 absolute -top-1 -right-1 items-center justify-center border-2 border-white">
                <Text className="text-white text-[9px] font-bold">
                  {unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Settings Gear */}
          <Pressable
            onPress={() => router.push("/screens/settings")}
            className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 shadow-sm active:bg-slate-100"
          >
            <Ionicons name="settings-outline" size={20} color="#334155" />
          </Pressable>

          {/* User Profile Avatar / Initial */}
          <Pressable
            onPress={() => router.push("/screens/settings/profile")}
            className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 items-center justify-center active:bg-primary/20"
          >
            <Text className="text-primary font-bold text-[15px]">
              {userName.charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default DashboardHeader;
