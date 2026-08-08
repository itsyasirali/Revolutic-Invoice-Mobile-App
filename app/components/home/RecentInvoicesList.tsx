import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export interface InvoiceDisplayItem {
  id: string;
  customer: string;
  amount: string;
  status: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}

interface RecentInvoicesListProps {
  invoices: InvoiceDisplayItem[];
  loading?: boolean;
}

const RecentInvoicesList: React.FC<RecentInvoicesListProps> = ({
  invoices,
  loading = false,
}) => {
  const router = useRouter();

  return (
    <View className="mt-7">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">Recent Invoices</Text>
        <Pressable onPress={() => router.push("/screens/Invoice" as any)}>
          <Text className="text-sm font-semibold text-primary">View All</Text>
        </Pressable>
      </View>

      {/* Invoice List Items */}
      {loading ? (
        <View className="py-8 items-center justify-center">
          <ActivityIndicator size="small" color="#1AA3FF" />
        </View>
      ) : (
        <View className="gap-3">
          {invoices.map((inv, index) => (
            <Pressable
              key={index}
              onPress={() => router.push("/screens/Invoice" as any)}
              className="flex-row items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm"
            >
              <View className="flex-row items-center gap-3">
                {/* Invoice ID + Customer */}
                <View>
                  <Text className="text-sm font-bold text-gray-900">
                    {inv.id}
                  </Text>
                  <Text className="text-xs text-gray-400 font-medium mt-0.5">
                    {inv.customer}
                  </Text>
                </View>
              </View>

              {/* Amount + Status Badge */}
              <View className="flex-col items-center gap-3">
                <Text className="text-sm font-bold text-gray-900">
                  {inv.amount}
                </Text>
                <View className={`px-3 py-1 rounded-full ${inv.badgeBg}`}>
                  <Text className={`text-xs font-bold ${inv.badgeText}`}>
                    {inv.status}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentInvoicesList;
