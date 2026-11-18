import React, { useRef, useState } from "react";
import { Animated, FlatList, Pressable, Text, View, useWindowDimensions, ViewToken } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIntroSeen } from "@/hooks/common/useIntroSeen";

interface Slide {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    key: "invoices",
    icon: "receipt-outline",
    title: "Create invoices in seconds",
    text: "Professional invoices with your own template. Send them by email or save the PDF.",
  },
  {
    key: "payments",
    icon: "wallet-outline",
    title: "Track payments and expenses",
    text: "Record payments, log expenses and see who owes you at a glance.",
  },
  {
    key: "reports",
    icon: "bar-chart-outline",
    title: "Run your business with clarity",
    text: "Quotes, projects, time tracking and live reports, all in one app.",
  },
];

/**
 * First-launch intro. It is shown once after installing the app; finishing or
 * skipping it is remembered on the phone, so later launches go straight on.
 */
const IntroScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { markSeen } = useIntroSeen();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    await markSeen();
    router.replace("/auth");
  };

  const next = () => {
    if (isLast) return finish();
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip */}
      <View className="flex-row justify-between items-center px-6 pt-2 h-12">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-md bg-primary items-center justify-center">
            <Ionicons name="receipt-outline" size={16} color="#fff" />
          </View>
          <Text className="ml-2 text-base font-bold text-slate-800">Invoice Smarty</Text>
        </View>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={10}>
            <Text className="text-slate-500 font-semibold text-base">Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={listRef as any}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <View className="w-64 h-64 rounded-full bg-primary/10 items-center justify-center">
              <View className="w-48 h-48 rounded-full bg-primary/15 items-center justify-center">
                <View className="w-32 h-32 rounded-full bg-primary items-center justify-center shadow-lg">
                  <Ionicons name={item.icon} size={60} color="#fff" />
                </View>
              </View>
            </View>
            <Text className="text-3xl font-extrabold text-center text-slate-900 mt-12 leading-9">{item.title}</Text>
            <Text className="text-base text-center text-slate-500 mt-3 leading-6">{item.text}</Text>
          </View>
        )}
      />

      {/* Dots + button */}
      <View className="px-6 pb-6">
        <View className="flex-row justify-center items-center mb-6">
          {SLIDES.map((s, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 26, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return <Animated.View key={s.key} style={{ width: dotWidth, opacity }} className="h-2 rounded-full bg-primary mx-1" />;
          })}
        </View>

        <Pressable onPress={next} className="w-full h-14 rounded-md bg-primary items-center justify-center flex-row active:bg-primary/90">
          <Text className="text-white font-bold text-base tracking-wide">{isLast ? "Get Started" : "Next"}</Text>
          <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={18} color="#fff" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default IntroScreen;
