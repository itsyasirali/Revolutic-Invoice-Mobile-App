import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useRecentInvoices, { InvoiceDisplayItem } from "@/hooks/dashboard/useRecentInvoices";

export type { InvoiceDisplayItem };

interface RecentInvoicesListProps {
  invoices?: InvoiceDisplayItem[];
  loading?: boolean;
}

const RecentInvoicesList: React.FC<RecentInvoicesListProps> = (props) => {
  const { invoices, loading } = useRecentInvoices(props);

  return (
    <View className="bg-white rounded-[22px] p-4 border border-slate-100 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3.5">
        <Text className="text-slate-900 font-bold text-[16px]">
          Recent Invoices
        </Text>
        <Pressable
          onPress={() => router.push("/screens/Invoice/invoices" as any)}
          className="flex-row items-center"
        >
          <Text style={{ color: "#1AA3FF" }} className="font-semibold text-[13px] mr-1">
            View all
          </Text>
          <Ionicons name="arrow-forward" size={13} color="#1AA3FF" />
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <View className="py-8 items-center justify-center">
          <ActivityIndicator size="small" color="#1AA3FF" />
        </View>
      ) : invoices.length > 0 ? (
        <View className="gap-2.5">
          {invoices.map((inv) => (
            <Pressable
              key={inv.id}
              onPress={() => router.push("/screens/Invoice/invoices" as any)}
              className="flex-row items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100/80 active:opacity-75"
            >
              {/* Left: Document Icon + Invoice info */}
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-10 h-10 rounded-full bg-[#1AA3FF]/15 items-center justify-center mr-3">
                  <Ionicons name="receipt-outline" size={18} color="#1AA3FF" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-slate-900 font-bold text-[13px]"
                    numberOfLines={1}
                  >
                    {inv.invoiceNumber}
                  </Text>
                  <Text
                    className="text-slate-400 text-[11px] mt-0.5"
                    numberOfLines={1}
                  >
                    {inv.customer} • {inv.date}
                  </Text>
                </View>
              </View>

              {/* Right: Amount + Status Badge */}
              <View className="items-end">
                <Text className="text-slate-900 font-extrabold text-[13.5px]">
                  {inv.amount}
                </Text>
                <View
                  className={`px-2.5 py-0.5 rounded-full mt-1 ${inv.badgeBg}`}
                >
                  <Text className={`text-[10.5px] font-bold ${inv.badgeText}`}>
                    {inv.status}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="py-8 items-center justify-center">
          <Ionicons name="document-text-outline" size={32} color="#cbd5e1" />
          <Text className="text-slate-400 text-[12px] mt-2 font-medium text-center">
            No recent invoices found
          </Text>
        </View>
      )}
    </View>
  );
};

export default RecentInvoicesList;
