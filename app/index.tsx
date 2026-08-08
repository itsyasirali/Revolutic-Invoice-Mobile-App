import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = () => {
  const router = useRouter();

  const goToAuth = () => router.push("/auth");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 pt-10">
        {/* 1. Icon */}
        <View className="items-center mt-6">
          <View className="w-24 h-24 bg-primary-light rounded-2xl items-center justify-center mb-4 shadow-md">
            <Ionicons name="receipt-outline" size={50} color="white" />
          </View>
        </View>

        {/* 2. Text */}
        <Text className="text-3xl font-bold text-center text-gray-950 leading-tight mt-4">
          Smarter Invoicing
        </Text>
        <Text className="text-2xl font-bold text-center text-gray-950 leading-tight">
          for Your Business
        </Text>
        <Text className="text-base text-center text-gray-500 mt-3 px-2">
          Create invoices, manage customers,{"\n"}track payments and get paid
          faster.
        </Text>

        {/* 3. Hero Image */}
        <View className="items-center mt-10">
          <Image
            source={require("../assets/hero.jpeg")}
            style={{
              width: "80%",
              height: 220,
              borderRadius: 20,
            }}
            resizeMode="contain"
          />
        </View>

        {/* 4. Button */}
        <View className="flex-1 justify-end pb-8">
          <Pressable
            onPress={goToAuth}
            className="w-full py-5 rounded-2xl bg-primary-light items-center justify-center shadow-sm"
          >
            <Text className="text-white font-bold text-base tracking-wide">
              Get Started
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IndexScreen;
