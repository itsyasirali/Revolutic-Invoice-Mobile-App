import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler, DeviceEventEmitter, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import axios from '@/services/api';
import { setStoredToken } from '@/utils/authToken';

export const useAuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const router = useRouter();

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

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
          return true;
        }
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
    }, [router]),
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields.');

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });

      if (response.data?.user) {
        if (response.data?.token) {
          await setStoredToken(response.data.token);
        }
        DeviceEventEmitter.emit('auth.changed');
        resetForm();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Try again.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword)
      return Alert.alert('Error', 'Please fill all fields.');
    if (password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match.');

    setLoading(true);
    try {
      await axios.post('/api/auth/signup', { name, email, password });
      await handleLogin();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Try again.';
      Alert.alert('Signup Failed', errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmVisibility = () => setShowConfirm((prev) => !prev);
  const switchToLogin = () => setIsSignup(false);
  const switchToSignup = () => setIsSignup(true);

  return {
    // states
    isSignup,
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    loading,
    isKeyboardVisible,

    // setters & actions
    setIsSignup,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirm,
    togglePasswordVisibility,
    toggleConfirmVisibility,
    switchToLogin,
    switchToSignup,
    handleBack,
    handleSubmit,
    resetForm,
    router,
  };
};

