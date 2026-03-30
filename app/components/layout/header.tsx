import React from "react";
import { View, Text, Pressable, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  subtitle: string;
  onMenuPress: () => void;
}

const Header: React.FC<Props> = ({ subtitle, onMenuPress }) => {
  return (
    <View
      className="w-full px-4 pb-3 flex-row justify-between items-center bg-gray-50 border-b border-gray-200 shadow-sm"
      style={{ paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 2 : 12 }}
    >
      {/* Brand */}
      <View className="flex-1">
        <Text className="text-xl font-bold text-slate-800">Revolutic</Text>
        <Text className="text-xs text-slate-500">{subtitle}</Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-2.5">
        <Pressable className="w-10 h-10 rounded-full justify-center items-center active:bg-slate-100">
          <Ionicons name="notifications-outline" size={24} color="#1e293b" />
        </Pressable>

        <Pressable
          onPress={onMenuPress}
          className="w-10 h-10 rounded-full justify-center items-center active:bg-slate-100"
        >
          <Ionicons name="menu" size={26} color="#1e293b" />
        </Pressable>
      </View>
    </View>
  );
};

export default Header;