import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useDashboardCharts } from "@/hooks/dashboard/useDashboardCharts";
import MonthChart from "../reports/MonthChart";

// Same periods as the web: 1M shows weekly points, the rest the last N months.
const PERIODS = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
] as const;

const BARS = [
  { key: "income", name: "Income", color: "#1AA3FF" },
  { key: "expenses", name: "Expenses", color: "#EF4444" },
];

/** Income vs Expenses bar chart (web "Revenue Overview"). */
const IncomeExpenseCard: React.FC = () => {
  const { data, loading } = useDashboardCharts();
  const [period, setPeriod] = useState<number>(6);
  const isWeekly = period === 1;

  const visible = useMemo(() => {
    if (!data) return [];
    if (isWeekly) return data.revenueOverviewWeekly ?? [];
    const all = data.revenueOverview ?? [];
    return all.slice(Math.max(all.length - period, 0));
  }, [data, period, isWeekly]);

  return (
    <View className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-2">
          <Text className="text-slate-900 font-bold text-[16px]">Income vs Expenses</Text>
        </View>
        <View className="flex-row items-center bg-slate-50 rounded-md p-0.5 border border-slate-200">
          {PERIODS.map((p) => {
            const active = p.months === period;
            return (
              <Pressable
                key={p.label}
                onPress={() => setPeriod(p.months)}
                className={`px-2.5 py-1 rounded-md ${active ? "bg-white" : ""}`}
              >
                <Text className={`text-[11px] font-semibold ${active ? "text-primary" : "text-slate-500"}`}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View className="h-56 items-center justify-center">
          <ActivityIndicator color="#1AA3FF" />
        </View>
      ) : (
        <MonthChart hideLegend months={visible} bars={BARS} currency={data?.salesOverview?.currency || ""} />
      )}
    </View>
  );
};

export default IncomeExpenseCard;
