import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle,
} from "react-native-svg";
import useRevenueHero, {
  PeriodSummary,
  PeriodType,
} from "@/hooks/dashboard/useRevenueHero";

export type { PeriodSummary, PeriodType };

interface RevenueHeroCardProps {
  userName?: string;
  userAvatar?: string;
  companyName?: string;
  periodData?: Record<PeriodType, PeriodSummary>;
  unreadCount?: number;
}

const RevenueHeroCard: React.FC<RevenueHeroCardProps> = (props) => {
  const {
    selectedPeriod,
    setSelectedPeriod,
    current,
    chartGeometry,
    formattedAmount,
    isPositive,
  } = useRevenueHero(props);

  return (
    <View className="px-4 mt-2">
      <LinearGradient
        colors={["#1AA3FF", "#008BE8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, overflow: "hidden" }}
        className="p-5 shadow-md border border-primary/20"
      >
          {/* Card Top Row: Label + Period Pill */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-white text-[15px] font-semibold mr-1.5">
                Total Revenue
              </Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="rgba(255,255,255,0.75)"
              />
            </View>

            {/* Week / Month / Year Pills */}
            <View style={styles.tabContainer}>
              {(["week", "month", "year"] as const).map((period) => {
                const isActive = selectedPeriod === period;
                const label = period.charAt(0).toUpperCase() + period.slice(1);
                return (
                  <Pressable
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    style={[
                      styles.tabButton,
                      isActive && styles.activeTabButton,
                    ]}
                  >
                    <Text
                      style={
                        isActive ? styles.activeTabText : styles.inactiveTabText
                      }
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Amount Number */}
          <Text className="text-white text-[32px] font-black tracking-tight mt-2.5">
            {formattedAmount}
          </Text>

          {/* Percentage vs last period */}
          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center">
              <Ionicons
                name={isPositive ? "arrow-up" : "arrow-forward"}
                size={14}
                color={isPositive ? "#4ade80" : "#ffffff"}
              />
              <Text
                className={`text-[13px] font-bold ml-0.5 ${
                  isPositive ? "text-[#4ade80]" : "text-white/90"
                }`}
              >
                {current.growth}
              </Text>
            </View>
            <Text className="text-white/75 text-[13px] ml-1.5 font-normal">
              {current.comparison}
            </Text>
          </View>

          {/* Glowing Wavy Line Chart (Dynamic from DB via hook) */}
          <View className="mt-3">
            <Svg height="85" width="100%" viewBox="0 0 330 85">
              <Defs>
                <SvgLinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                  <Stop offset="60%" stopColor="#ffffff" stopOpacity="0.10" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </SvgLinearGradient>
              </Defs>

              {/* Gradient Area under Curve */}
              <Path d={chartGeometry.areaPath} fill="url(#chartFill)" />

              {/* Smooth White Curved Line */}
              <Path
                d={chartGeometry.curvePath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points on curve */}
              {chartGeometry.coords.map((pt, idx) => (
                <Circle
                  key={idx}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="2.5"
                  fill="#ffffff"
                  fillOpacity="0.7"
                />
              ))}

              {/* Peak Point Glowing Indicator (only if we have positive data) */}
              {chartGeometry.hasData && (
                <>
                  <Circle
                    cx={chartGeometry.peak.cx}
                    cy={chartGeometry.peak.cy}
                    r="7"
                    fill="rgba(255,255,255,0.3)"
                  />
                  <Circle
                    cx={chartGeometry.peak.cx}
                    cy={chartGeometry.peak.cy}
                    r="4"
                    fill="#ffffff"
                  />
                </>
              )}
            </Svg>

            {/* Labels (X-Axis) */}
            <View className="flex-row justify-between px-1 mt-1">
              {current.labels.map((label) => (
                <Text
                  key={label}
                  className="text-white/70 text-[11px] font-medium text-center"
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: 9999,
    padding: 2,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  activeTabButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTabText: {
    color: "#1AA3FF",
    fontSize: 12,
    fontWeight: "700",
  },
  inactiveTabText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default RevenueHeroCard;
