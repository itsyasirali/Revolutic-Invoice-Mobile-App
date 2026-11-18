import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler, DeviceEventEmitter, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import axios from '@/services/api';
import { setStoredToken } from '@/utils/authToken';
import { setStoredActiveOrgId } from '@/utils/activeOrg';
import { updateCachedOrganization } from '@/context/OrganizationContext';
import { updateCachedUser } from '@/hooks/auth/useProfile';

// Web client ID only: it makes Google issue an ID token our server can verify.
GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

export const useAuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // Stores the session and moves the app to the signed-in state.
  const completeLogin = async (data: any) => {
    const userData = data.user;
    const orgData = userData.organization || null;

    if (data.token) await setStoredToken(data.token);
    if (orgData?.id) await setStoredActiveOrgId(orgData.id);

    updateCachedUser(userData);
    updateCachedOrganization(orgData, orgData ? [orgData] : []);

    DeviceEventEmitter.emit('auth.changed', { user: userData, org: orgData });
  };

  // Google sign-in inside the app: Google's own account picker, no browser.
  const handleGoogle = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      return Alert.alert('Google Sign-In', 'Google sign-in is not set up in this build.');
    }
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut().catch(() => {}); // always offer the account chooser
      const result = await GoogleSignin.signIn();
      if (result.type !== 'success') return; // closed without choosing an account

      const idToken = result.data.idToken;
      if (!idToken) return Alert.alert('Google Sign-In', 'Google did not return a sign-in token. Please try again.');

      const { data } = await axios.post('/api/auth/google/mobile', { idToken });
      if (data?.user) {
        await completeLogin(data);
        resetForm();
      }
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) return;
        if (err.code === statusCodes.IN_PROGRESS) return;
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return Alert.alert('Google Sign-In', 'Google Play services are not available on this phone.');
        }
      }
      Alert.alert('Google Sign-In', err?.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Sends the reset link by email (the reset itself happens on the web page it opens).
  const handleForgotPassword = async () => {
    const address = email.trim();
    if (!address) return Alert.alert('Forgot password', 'Enter your email address above first.');
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email: address });
      Alert.alert('Check your email', data?.message || 'If that email exists, a password reset link has been sent.');
    } catch (err: any) {
      Alert.alert('Forgot password', err?.response?.data?.message || 'Could not send the reset link. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields.');

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });

      if (response.data?.user) {
        await completeLogin(response.data);
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
    googleLoading,
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
    handleSubmit,
    handleGoogle,
    handleForgotPassword,
    resetForm,
    router,
  };
};

