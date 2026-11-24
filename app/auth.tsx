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
    step,
    otp,
    setOtp,
    resendIn,
    handleVerifyOtp,
    handleResendOtp,
    backToForm,
    openForgot,
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
            <Text className="text-white text-2xl font-extrabold mt-2 tracking-wide">InvoiceSmarty</Text>
            <Text className="text-white/85 text-sm mt-1 text-center">
              {step === "otp" ? "Verify your email" : step === "forgot" || step === "forgotSent" ? "Reset your password" : isSignup ? "Create your account to get started" : "Sign in to manage your invoices"}
            </Text>
          </View>

          {/* Form sheet */}
          <View className="flex-1 bg-white rounded-t-3xl px-6 pt-7" style={{ paddingBottom: insets.bottom + 24 }}>
            {step === "forgot" ? (
              <>
                <Text className="text-slate-800 text-lg font-bold mb-1">Forgot your password?</Text>
                <Text className="text-slate-500 text-sm mb-5">Enter your account email and we will send you a link to choose a new password.</Text>
                <InputField
                  label="Email"
                  placeholder="you@company.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  leftIcon={<Ionicons name="mail-outline" size={18} color={ICON} />}
                  containerStyle="mb-6"
                />
                <Pressable
                  onPress={handleForgotPassword}
                  disabled={busy}
                  className={`h-14 rounded-md bg-primary items-center justify-center ${busy ? "opacity-70" : ""}`}
                >
                  {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-base">Send reset link</Text>}
                </Pressable>
                <Pressable onPress={backToForm} className="items-center mt-6" hitSlop={6}>
                  <Text className="text-primary font-bold text-sm">Back to login</Text>
                </Pressable>
              </>
            ) : step === "forgotSent" ? (
              <>
                <View className="items-center mb-4">
                  <Ionicons name="mail-open-outline" size={48} color="#1AA3FF" />
                </View>
                <Text className="text-slate-800 text-lg font-bold text-center mb-2">Check your email</Text>
                <Text className="text-slate-500 text-sm text-center mb-6">
                  If an account exists for {email.trim()}, we sent a password reset link. Open it, choose a new password, then come back and log in. The link expires in 1 hour.
                </Text>
                <Pressable onPress={backToForm} className="h-14 rounded-md bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-base">Back to login</Text>
                </Pressable>
                <View className="flex-row justify-center mt-6">
                  <Text className="text-slate-500 text-sm">{"Didn't get it? "}</Text>
                  <Pressable onPress={handleForgotPassword} disabled={busy || resendIn > 0} hitSlop={6}>
                    <Text className={`font-bold text-sm ${resendIn > 0 ? "text-slate-400" : "text-primary"}`}>
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend link"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : null}
            {step === "forgot" || step === "forgotSent" ? null : step === "otp" ? (
              <>
                <Text className="text-slate-800 text-lg font-bold mb-1">Enter verification code</Text>
                <Text className="text-slate-500 text-sm mb-5">We sent a 6-digit code to {email.trim()}. It expires in 5 minutes.</Text>
                <InputField
                  label="Verification code"
                  placeholder="123456"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  leftIcon={<Ionicons name="keypad-outline" size={18} color={ICON} />}
                  containerStyle="mb-6"
                />
                <Pressable
                  onPress={handleVerifyOtp}
                  disabled={busy}
                  className={`h-14 rounded-md bg-primary items-center justify-center ${busy ? "opacity-70" : ""}`}
                >
                  {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-base">Verify & Continue</Text>}
                </Pressable>
                <View className="flex-row justify-center mt-6">
                  <Text className="text-slate-500 text-sm">{"Didn't get it? "}</Text>
                  <Pressable onPress={handleResendOtp} disabled={busy || resendIn > 0} hitSlop={6}>
                    <Text className={`font-bold text-sm ${resendIn > 0 ? "text-slate-400" : "text-primary"}`}>
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                    </Text>
                  </Pressable>
                </View>
                <Pressable onPress={backToForm} className="items-center mt-4" hitSlop={6}>
                  <Text className="text-slate-500 text-sm">Back</Text>
                </Pressable>
              </>
            ) : (
              <>
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
                <Pressable onPress={openForgot} hitSlop={8}>
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
              <Text className="text-slate-500 text-sm">{isSignup ? "Already have an account? " : "New to InvoiceSmarty? "}</Text>
              <Pressable onPress={isSignup ? switchToLogin : switchToSignup} hitSlop={6}>
                <Text className="text-primary font-bold text-sm">{isSignup ? "Login" : "Sign Up"}</Text>
              </Pressable>
            </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthScreen;
