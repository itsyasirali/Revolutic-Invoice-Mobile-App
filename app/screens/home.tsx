import React from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import useDashboard from "@/hooks/dashboard/useDashboard";
import RevenueHeroCard from "../components/home/RevenueHeroCard";
import InvoiceStatusCard from "../components/home/InvoiceStatusCard";
import QuickActions from "../components/home/QuickActions";
import RecentInvoicesList from "../components/home/RecentInvoicesList";

const Home: React.FC = () => {
  const { isRefreshing, handleRefresh } = useDashboard();

  return (
    <View className="flex-1 bg-[#f4f7fb]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#1AA3FF"
            colors={["#1AA3FF"]}
          />
        }
      >
        {/* 1. Header + Dynamic Revenue Hero Card */}
        <RevenueHeroCard />

        {/* 2. Main Content Body */}
        <View className="px-4 mt-4 gap-4">
          <QuickActions />
          <InvoiceStatusCard />
          <RecentInvoicesList />
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
