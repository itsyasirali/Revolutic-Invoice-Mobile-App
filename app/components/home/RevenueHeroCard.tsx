import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface RevenueHeroCardProps {
  userInitial: string;
  formattedRevenue: string;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTER_OPTIONS = [
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
];

const RevenueHeroCard: React.FC<RevenueHeroCardProps> = ({
  userInitial,
  formattedRevenue,
  selectedFilter,
  onFilterChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
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
      <View className="bg-white/15 border border-white/25 rounded-2xl p-5  relative overflow-hidden">
        {/* Top Row: Total Revenue + Filter Dropdown */}
        <View className="flex-row items-center justify-between z-10">
          <Text className="text-white/80 text-xs font-medium">
            Total Revenue
          </Text>

          <Pressable
            onPress={() => setModalVisible(true)}
            className="flex-row items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full border border-white/20"
          >
            <Text className="text-white text-xs font-medium">
              {selectedFilter}
            </Text>
            <Ionicons name="chevron-down" size={12} color="white" />
          </Pressable>
        </View>

        {/* Value Amount */}
        <Text className="text-3xl font-extrabold text-white mt-3 mb-1.5 z-10">
          {formattedRevenue}
        </Text>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          className="flex-1 bg-black/40 justify-center items-center px-6"
        >
          <View className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <Text className="text-base font-bold text-gray-900 mb-3">
              Select Time Range
            </Text>
            {FILTER_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => {
                  onFilterChange(opt);
                  setModalVisible(false);
                }}
                className={`py-3 px-4 rounded-xl mb-1 flex-row items-center justify-between ${
                  selectedFilter === opt ? "bg-primary/10" : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedFilter === opt ? "text-primary" : "text-gray-700"
                  }`}
                >
                  {opt}
                </Text>
                {selectedFilter === opt && (
                  <Ionicons name="checkmark" size={18} color="#1AA3FF" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default RevenueHeroCard;
