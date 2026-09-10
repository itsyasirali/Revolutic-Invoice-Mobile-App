import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDashboardHeader } from "@/hooks/dashboard/useDashboardHeader";

interface DashboardHeaderProps {
  userName?: string;
  unreadCount?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName: customUserName,
  unreadCount = 0,
}) => {
  const {
    userName,
    userInitial,
    greeting,
    insets,
    handleGoSettings,
    handleGoProfile,
  } = useDashboardHeader(customUserName);

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
            onPress={handleGoSettings}
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
            onPress={handleGoSettings}
            className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 shadow-sm active:bg-slate-100"
          >
            <Ionicons name="settings-outline" size={20} color="#334155" />
          </Pressable>

          {/* User Profile Avatar / Initial */}
          <Pressable
            onPress={handleGoProfile}
            className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 items-center justify-center active:bg-primary/20"
          >
            <Text className="text-primary font-bold text-[15px]">
              {userInitial}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default DashboardHeader;
