import React from "react";
import { View, Text, Image } from "react-native";

export default function CustomSplashScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center justify-center">
        {/* App Icon */}
        <View className="w-28 h-28">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-24 h-24 rounded-2xl"
            resizeMode="contain"
          />
        </View>

        {/* Brand Titles */}
        <Text className="text-3xl font-extrabold text-gray-900 tracking-wide mb-2 text-center">
          Revolutic Invoice
        </Text>
        <Text className="text-sm font-medium text-gray-500 text-center">
          Smarter Invoicing for Your Business
        </Text>
      </View>
    </View>
  );
}
