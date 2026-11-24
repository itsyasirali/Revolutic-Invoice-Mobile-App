import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler, DeviceEventEmitter, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import axios from '@/services/api';
import { setStoredToken } from '@/utils/authToken';
import { setStoredActiveOrgId } from '@/utils/activeOrg';
import { updateCachedOrganization } from '@/context/OrganizationContext';
import { updateCachedUser } from '@/hooks/auth/useProfile';

// Web client ID only: it makes Google issue an ID token our server can verify.
// Loaded defensively: the native module is missing in Expo Go / builds made before the plugin was added.
let GoogleSignin: any = null;
let isErrorWithCode: (e: any) => boolean = () => false;
let statusCodes: any = {};
try {
  const g = require('@react-native-google-signin/google-signin');
  GoogleSignin = g.GoogleSignin;
  isErrorWithCode = g.isErrorWithCode;
  statusCodes = g.statusCodes;
  GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
} catch {
  GoogleSignin = null;
}

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
  // Email verification (OTP) step shown after signup, or after a login on an unverified account.
  const [step, setStep] = useState<'form' | 'otp' | 'forgot' | 'forgotSent'>('form');
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);

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

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (step !== 'form') {
          setStep('form');
          setOtp('');
          return true;
        }
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
    }, [router, step]),
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    setLoading(false);
    setOtp('');
    setStep('form');
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
    if (!GoogleSignin) {
      return Alert.alert('Google Sign-In', 'Google sign-in needs a rebuilt app. Run "npx expo run:android" (Expo Go is not supported).');
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
      Alert.alert('Google Sign-In', err?.response?.data?.message || `Google sign-in failed (${err?.code ?? ''} ${err?.message ?? 'unknown'}). Please try again.`);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Opens the forgot-password step (email is kept if it was already typed).
  const openForgot = () => setStep('forgot');

  // Sends the reset link by email (the reset itself happens on the web page it opens).
  const handleForgotPassword = async () => {
    const address = email.trim();
    if (!address) return Alert.alert('Forgot password', 'Enter your email address.');
    if (!/^\S+@\S+\.\S+$/.test(address)) return Alert.alert('Forgot password', 'Enter a valid email address.');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: address });
      setStep('forgotSent');
      setResendIn(30);
    } catch (err: any) {
      Alert.alert('Forgot password', err?.response?.data?.message || `Could not send the reset link (${err?.message || 'no response'}). Please try again.`);
    } finally {
      setLoading(false);
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
      if (err.response?.status === 403 && /verify your email/i.test(err.response?.data?.message || '')) {
        // Account exists but email isn't verified yet: send a fresh code and ask for it.
        await startVerification();
        return;
      }
      const errorMessage = err.response?.data?.message || `Login failed (${err?.message || 'no response'}). Try again.`;
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sends (or re-sends) the signup verification code. Needs name/email/password from the form.
  const requestSignupCode = async () => {
    await axios.post('/api/auth/signup', { name: name.trim(), email: email.trim(), password });
    setOtp('');
    setStep('otp');
    setResendIn(30);
  };

  const startVerification = async () => {
    try {
      await requestSignupCode();
    } catch (err: any) {
      Alert.alert('Verification', err?.response?.data?.message || 'Could not send the verification code. Please try again.');
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword)
      return Alert.alert('Error', 'Please fill all fields.');
    if (password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match.');
    // Same rule as the server, so the user gets feedback without a round trip.
    if (password.length < 8) return Alert.alert('Weak password', 'Password must be at least 8 characters long.');
    if (!/[A-Za-z]/.test(password)) return Alert.alert('Weak password', 'Password must contain at least one letter.');
    if (!/[0-9]/.test(password)) return Alert.alert('Weak password', 'Password must contain at least one number.');

    setLoading(true);
    try {
      await requestSignupCode();
    } catch (err: any) {
      Alert.alert('Signup Failed', err?.response?.data?.message || `Signup failed (${err?.message || 'no response'}). Try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.trim();
    if (code.length !== 6) return Alert.alert('Verification', 'Enter the 6-digit code from your email.');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/signup/verify', { email: email.trim(), otp: code });
      if (data?.user) {
        await completeLogin(data);
        resetForm();
      }
    } catch (err: any) {
      Alert.alert('Verification failed', err?.response?.data?.message || 'Could not verify the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendIn > 0) return;
    setLoading(true);
    try {
      await requestSignupCode();
      Alert.alert('Code sent', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Verification', err?.response?.data?.message || 'Could not resend the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backToForm = () => {
    setStep('form');
    setOtp('');
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
    step,
    otp,
    setOtp,
    resendIn,
    handleVerifyOtp,
    handleResendOtp,
    backToForm,
    openForgot,
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

