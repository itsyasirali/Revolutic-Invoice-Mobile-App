import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface RevenueHeroCardProps {
  userInitial: string;
  formattedRevenue: string;
}

const RevenueHeroCard: React.FC<RevenueHeroCardProps> = ({
  userInitial,
  formattedRevenue,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-primary pb-6 px-5 rounded-b-[32px]"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-white tracking-tight">
          Dashboard
        </Text>

        <View className="flex-row items-center gap-3">
          {/* Notification Bell */}
          <Pressable className="w-10 h-10 rounded-full bg-white/20 items-center justify-center relative">
            <Ionicons name="notifications-outline" size={20} color="white" />
            <View className="w-2.5 h-2.5 rounded-full bg-white absolute top-2 right-2 border border-primary" />
          </Pressable>

          {/* Settings */}
          <Pressable
            onPress={() => router.push('/screens/settings')}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </Pressable>

          {/* Profile Avatar (tap to open settings) */}
          <Pressable
            onPress={() => router.push('/screens/settings')}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 items-center justify-center"
          >
            <Text className="text-white font-bold text-sm">{userInitial}</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero Revenue Card */}
      <View className="bg-white/15 border border-white/25 rounded-2xl p-5 relative overflow-hidden">
        <Text className="text-white/80 text-xs font-medium">
          Total Revenue
        </Text>

        {/* Value Amount */}
        <Text className="text-3xl font-extrabold text-white mt-3 mb-1.5">
          {formattedRevenue}
        </Text>
      </View>
    </View>
  );
};

export default RevenueHeroCard;
