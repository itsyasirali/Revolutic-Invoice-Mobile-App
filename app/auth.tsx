import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import InputField from "./components/ui/InputField";
import StandardButton from "./components/ui/StandardButton";

const AuthScreen = () => {
  const router = useRouter();
  const {
    isSignup,
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    loading,
    setIsSignup,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirm,
    handleSubmit,
  } = useAuthForm();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
    }, []),
  );

  return (
    <View className="flex-1 bg-white pt-10">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isKeyboardVisible ? 300 : 40,
          }}
        >
          <View className="flex-1 px-6 pt-4">
            {/* Back button */}
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mb-6"
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </Pressable>

            {/* Heading */}
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {isSignup ? "Create Account" : "Welcome back!"}
            </Text>
            <Text className="text-sm text-gray-500 mb-8">
              {isSignup
                ? "Fill in the details below to get started"
                : "Login to continue to your account"}
            </Text>

            {/* Tab Toggle */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
              <Pressable
                onPress={() => setIsSignup(false)}
                className={`flex-1 py-3 rounded-lg items-center ${!isSignup ? "bg-primary-light" : ""}`}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: !isSignup ? "#ffffff" : "#6b7280" }}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsSignup(true)}
                className={`flex-1 py-3 rounded-lg items-center ${
                  isSignup ? "bg-primary-light" : ""
                }`}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: isSignup ? "#ffffff" : "#6b7280" }}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Name field (Sign Up only) */}
            {isSignup && (
              <InputField
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                leftIcon={
                  <Ionicons name="person-outline" size={18} color="#9ca3af" />
                }
                containerStyle="mb-4"
              />
            )}

            {/* Email */}
            <InputField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="mail-outline" size={18} color="#9ca3af" />
              }
              containerStyle="mb-4"
            />

            {/* Password */}
            <InputField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#9ca3af"
                />
              }
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#9ca3af"
                  />
                </Pressable>
              }
              containerStyle="mb-2"
            />

            {/* Forgot Password */}
            {!isSignup && (
              <View className="items-end mb-6">
                <Pressable>
                  <Text className="text-primary-light font-semibold text-sm">
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Confirm Password (Sign Up only) */}
            {isSignup && (
              <InputField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#9ca3af"
                  />
                }
                rightIcon={
                  <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#9ca3af"
                    />
                  </Pressable>
                }
                containerStyle="mt-4 mb-6"
              />
            )}

            {/* Submit Button */}
            <StandardButton
              onPress={handleSubmit}
              title={isSignup ? "Sign Up" : "Login"}
              loading={loading}
              className="mb-6 shadow-sm"
              textClassName="text-base font-bold tracking-wide"
            />

            {/* Or continue with */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">
                or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row gap-4 mb-8">
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm">
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text className="font-semibold text-gray-700 text-sm">
                  Google
                </Text>
              </Pressable>
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm">
                <Ionicons name="logo-apple" size={20} color="#1C1C1E" />
                <Text className="font-semibold text-gray-700 text-sm">
                  Apple
                </Text>
              </Pressable>
            </View>

            {/* Terms */}
            <Text className="text-center text-gray-400 text-xs pb-2">
              By continuing, you agree to our{" "}
              <Text className="text-primary-light font-semibold">
                Terms & Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthScreen;
