import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import InputField from "./components/ui/InputField";
import StandardButton from "./components/ui/StandardButton";

const AuthScreen = () => {
  const {
    isSignup,
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    loading,
    isKeyboardVisible,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmVisibility,
    switchToLogin,
    switchToSignup,
    handleBack,
    handleSubmit,
  } = useAuthForm();

  return (
    <View className="flex-1 bg-white pt-10">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isKeyboardVisible ? 380 : 50,
          }}
        >
          <View className="flex-1 px-6 pt-4">
            {/* Back button */}
            <Pressable
              onPress={handleBack}
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
                onPress={switchToLogin}
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
                onPress={switchToSignup}
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
                placeholder="Enter your name"
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
              placeholder="Enter your email address"
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
                <Pressable onPress={togglePasswordVisibility}>
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
                  <Pressable onPress={toggleConfirmVisibility}>
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

