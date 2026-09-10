import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useInvoiceStatus, { InvoiceStatusMetrics } from "@/hooks/dashboard/useInvoiceStatus";

type InvoiceStatusCardProps = Partial<InvoiceStatusMetrics>;

const InvoiceStatusCard: React.FC<InvoiceStatusCardProps> = (props) => {
  const {
    paidPercent,
    paidCount,
    pendingPercent,
    pendingCount,
    overduePercent,
    overdueCount,
    totalCount,
  } = useInvoiceStatus(props);

  return (
    <View className="bg-white rounded-[22px] p-4 border border-slate-100 shadow-sm">
      {/* Card Header */}
      <View className="flex-row items-center justify-between mb-3.5">
        <Text className="text-slate-900 font-bold text-[16px]">
          Invoice Status
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

      {/* Multi-segment Progress Bar */}
      <View className="h-2.5 rounded-full overflow-hidden flex-row bg-slate-100 mb-4">
        {totalCount > 0 ? (
          <>
            {paidPercent > 0 && (
              <View
                style={{ width: `${paidPercent}%` }}
                className="h-full bg-emerald-500"
              />
            )}
            {pendingPercent > 0 && (
              <View
                style={{ width: `${pendingPercent}%` }}
                className="h-full bg-amber-500"
              />
            )}
            {overduePercent > 0 && (
              <View
                style={{ width: `${overduePercent}%` }}
                className="h-full bg-rose-500"
              />
            )}
          </>
        ) : (
          <View className="w-full h-full bg-slate-200/60" />
        )}
      </View>

      {/* 3 Metric Columns */}
      <View className="flex-row items-start justify-between">
        {/* 1. Paid */}
        <View className="flex-1 pr-1">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="text-slate-800 font-semibold text-[12.5px]">
              Paid
            </Text>
          </View>
          <Text className="text-slate-900 font-extrabold text-[17px] mt-1.5">
            {paidPercent}%
          </Text>
          <Text className="text-slate-400 text-[11px] mt-0.5 font-normal">
            {paidCount} {paidCount === 1 ? "invoice" : "invoices"}
          </Text>
        </View>

        {/* 2. Pending */}
        <View className="flex-1 px-2 border-l border-slate-100">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
            <Text className="text-slate-800 font-semibold text-[12.5px]">
              Pending
            </Text>
          </View>
          <Text className="text-slate-900 font-extrabold text-[17px] mt-1.5">
            {pendingPercent}%
          </Text>
          <Text className="text-slate-400 text-[11px] mt-0.5 font-normal">
            {pendingCount} {pendingCount === 1 ? "invoice" : "invoices"}
          </Text>
        </View>

        {/* 3. Overdue */}
        <View className="flex-1 pl-2 border-l border-slate-100">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" />
            <Text className="text-slate-800 font-semibold text-[12.5px]">
              Overdue
            </Text>
          </View>
          <Text className="text-slate-900 font-extrabold text-[17px] mt-1.5">
            {overduePercent}%
          </Text>
          <Text className="text-slate-400 text-[11px] mt-0.5 font-normal">
            {overdueCount} {overdueCount === 1 ? "invoice" : "invoices"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InvoiceStatusCard;
