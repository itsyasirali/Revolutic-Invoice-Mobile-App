import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardsProps {
  totalCount: number;
  paidCount: number;
  pendingCount: number;
}

const StatCards: React.FC<StatCardsProps> = ({
  totalCount,
  paidCount,
  pendingCount,
}) => {
  return (
    <View className="flex-row gap-3">
      {/* 1. Invoices */}
      <View className="flex-1 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
        <View className="flex-row items-center gap-1.5 self-start">
          <Ionicons name="receipt-outline" size={14} color="#1AA3FF" />
          <Text className="text-primary font-semibold text-xs">Invoices</Text>
        </View>
        <Text className="text-2xl font-extrabold text-gray-900 mt-3 mb-0.5">
          {totalCount}
        </Text>
        <Text className="text-xs text-gray-400 font-medium">Total</Text>
      </View>

      {/* 2. Paid */}
      <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <View className="flex-row items-center gap-1.5 self-start">
          <Ionicons name="checkbox-outline" size={14} color="#1AA3FF" />
          <Text className="text-primary font-semibold text-xs">Paid</Text>
        </View>
        <Text className="text-2xl font-extrabold text-gray-900 mt-3 mb-0.5">
          {paidCount}
        </Text>
        <Text className="text-xs text-gray-400 font-medium">Total</Text>
      </View>

      {/* 3. Pending */}
      <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <View className="flex-row items-center gap-1.5 self-start">
          <Ionicons name="ellipse-outline" size={14} color="#F59E0B" />
          <Text className="text-amber-600 font-semibold text-xs">Pending</Text>
        </View>
        <Text className="text-2xl font-extrabold text-gray-900 mt-3 mb-0.5">
          {pendingCount}
        </Text>
        <Text className="text-xs text-gray-400 font-medium">Total</Text>
      </View>
    </View>
  );
};

export default StatCards;
