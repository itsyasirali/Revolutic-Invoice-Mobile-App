import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useState, useEffect } from 'react'
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useAuthForm } from '@/hooks/auth/useAuthForm'
import InputField from './components/ui/InputField'
import StandardButton from './components/ui/StandardButton'


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
    setIsSignup,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirm,
    handleSubmit,
  } = useAuthForm()

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ])
        return true
      }
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => backHandler.remove()
    }, [])
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Top Blue Section */}
          <View className="h-[25%] bg-primary justify-center items-center pt-10">
            <View className="w-24 h-24 rounded-full border-4 border-white items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={50} color="white" />
            </View>
            <Text className="text-3xl font-bold text-white tracking-wider">
              Revolutic
            </Text>
          </View>

          {/* Bottom White Section */}
          <View className="flex-1 bg-white rounded-t-[35px] px-8 pt-10">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: isKeyboardVisible ? 350 : 80 }}
            >
              <Text className="text-3xl font-bold text-center text-slate-800 mb-8">
                {isSignup ? 'Sign Up' : 'Login'}
              </Text>

              {isSignup && (
                <InputField
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  leftIcon={<Ionicons name="person-outline" size={20} color="#9ca3af" />}
                  containerStyle="mb-4"
                  // Clean standard look
                  inputStyle="flex-1 text-base text-slate-800 ml-2"
                />
              )}

              <InputField
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="person-outline" size={20} color="#9ca3af" />}
                containerStyle="mb-4"
                inputStyle="flex-1 text-base text-slate-800 ml-2"
              />

              <InputField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />}
                rightIcon={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                  </Pressable>
                }
                containerStyle="mb-4"
                inputStyle="flex-1 text-base text-slate-800 ml-2"
              />

              {isSignup && (
                <InputField
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />}
                  rightIcon={
                    <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                      <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                    </Pressable>
                  }
                  containerStyle="mb-4"
                  inputStyle="flex-1 text-base text-slate-800 ml-2"
                />
              )}

              {!isSignup && (
                <View className="items-end mb-6">
                  <Pressable>
                    <Text className="text-gray-500">Forgot password?</Text>
                  </Pressable>
                </View>
              )}

              <StandardButton
                onPress={handleSubmit}
                title={isSignup ? 'SIGN UP' : 'LOGIN'}
                loading={loading}
                className="mb-6 shadow-sm"
                textClassName="text-lg uppercase tracking-wider font-bold"
              />

              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-gray-300" />
                <Text className="mx-4 text-gray-500">Or sign in with</Text>
                <View className="flex-1 h-[1px] bg-gray-300" />
              </View>

              <View className="flex-row justify-center space-x-6 mb-8 gap-4">
                <Pressable className="w-12 h-12 bg-white rounded-lg border border-gray-200 items-center justify-center shadow-sm">
                  <Ionicons name="logo-google" size={24} color="#EA4335" />
                </Pressable>
                <Pressable className="w-12 h-12 bg-white rounded-lg border border-gray-200 items-center justify-center shadow-sm">
                  <Ionicons name="keypad-outline" size={24} color="#16a34a" />
                </Pressable>
                <Pressable className="w-12 h-12 bg-white rounded-lg border border-gray-200 items-center justify-center shadow-sm">
                  <Ionicons name="logo-microsoft" size={24} color="#00a4ef" />
                </Pressable>
              </View>

              <Pressable onPress={() => setIsSignup(!isSignup)} className="pb-8">
                <Text className="text-center text-gray-600">
                  {isSignup ? "Already have an account? " : "Don't have an account? "}
                  <Text className="text-cyan-600 font-bold">
                    {isSignup ? "Login" : "Sign Up"}
                  </Text>
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default AuthScreen
