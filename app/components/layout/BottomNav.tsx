import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomNav } from "@/hooks/common/useBottomNav";

const BottomNav: React.FC = () => {
  const { navItems, insets, handleNavItemPress } = useBottomNav();

  return (
    <View
      className="bg-white border-t border-slate-100 px-3 pt-2.5 flex-row justify-around items-center shadow-lg"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {navItems.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => handleNavItemPress(item)}
          className="items-center justify-center min-w-[56px]"
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={item.isActive ? "#1AA3FF" : "#94a3b8"}
          />
          <Text
            style={item.isActive ? { color: "#1AA3FF" } : undefined}
            className={`text-[11px] mt-0.5 ${
              item.isActive ? "font-bold" : "font-medium text-slate-500"
            }`}
          >
            {item.label}
          </Text>
          {item.isActive ? (
            <View
              style={{ backgroundColor: "#1AA3FF" }}
              className="w-5 h-1 rounded-full mt-1"
            />
          ) : (
            <View className="w-5 h-1 mt-1 opacity-0" />
          )}
        </Pressable>
      ))}
    </View>
  );
};

export default BottomNav;
