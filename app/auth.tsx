import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  Pressable,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import InputField from "./components/ui/InputField";

const ICON = "#94a3b8";

const AuthScreen = () => {
  const insets = useSafeAreaInsets();
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
    handleSubmit,
    handleGoogle,
    handleForgotPassword,
    googleLoading,
  } = useAuthForm();

  const busy = loading || googleLoading;

  return (
    <View className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#1AA3FF" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: isKeyboardVisible ? 280 : 0 }}
        >
          {/* Brand header */}
          <View className="items-center px-6 pb-14" style={{ paddingTop: insets.top + 28 }}>
            <Image source={require("../assets/images/adaptive-icon.png")} style={{ width: 84, height: 84 }} resizeMode="contain" />
            <Text className="text-white text-2xl font-extrabold mt-2 tracking-wide">Invoice Smarty</Text>
            <Text className="text-white/85 text-sm mt-1 text-center">
              {isSignup ? "Create your account to get started" : "Sign in to manage your invoices"}
            </Text>
          </View>

          {/* Form sheet */}
          <View className="flex-1 bg-white rounded-t-3xl px-6 pt-7" style={{ paddingBottom: insets.bottom + 24 }}>
            {isSignup && (
              <InputField
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                leftIcon={<Ionicons name="person-outline" size={18} color={ICON} />}
                containerStyle="mb-4"
              />
            )}

            <InputField
              label="Email"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail-outline" size={18} color={ICON} />}
              containerStyle="mb-4"
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={ICON} />}
              rightIcon={
                <Pressable onPress={togglePasswordVisibility} hitSlop={8}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={ICON} />
                </Pressable>
              }
              containerStyle="mb-2"
            />

            {!isSignup && (
              <View className="items-end mb-5">
                <Pressable onPress={handleForgotPassword} hitSlop={8}>
                  <Text className="text-primary font-semibold text-sm">Forgot password?</Text>
                </Pressable>
              </View>
            )}

            {isSignup && (
              <InputField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={ICON} />}
                rightIcon={
                  <Pressable onPress={toggleConfirmVisibility} hitSlop={8}>
                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color={ICON} />
                  </Pressable>
                }
                containerStyle="mt-2 mb-6"
              />
            )}

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={busy}
              className={`h-14 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary/90 ${busy ? "opacity-70" : ""}`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">{isSignup ? "Create Account" : "Login"}</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-slate-200" />
              <Text className="mx-4 text-slate-400 text-xs uppercase tracking-wider">or</Text>
              <View className="flex-1 h-[1px] bg-slate-200" />
            </View>

            {/* Google */}
            <Pressable
              onPress={handleGoogle}
              disabled={busy}
              className={`h-14 flex-row items-center justify-center rounded-md border border-slate-200 bg-white active:bg-slate-50 ${googleLoading ? "opacity-60" : ""}`}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#EA4335" />
              ) : (
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              )}
              <Text className="font-semibold text-slate-700 text-base ml-3">Continue with Google</Text>
            </Pressable>

            {/* Switch between login and sign up */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500 text-sm">{isSignup ? "Already have an account? " : "New to Invoice Smarty? "}</Text>
              <Pressable onPress={isSignup ? switchToLogin : switchToSignup} hitSlop={6}>
                <Text className="text-primary font-bold text-sm">{isSignup ? "Login" : "Sign Up"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthScreen;
