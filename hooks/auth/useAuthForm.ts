import { useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import { useRouter } from 'expo-router';
import axios from '@/services/api';

export const useAuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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
        DeviceEventEmitter.emit('auth.changed');
        // Wait for the router to push to the home screen after login
        resetForm();
        router.replace('/screens/home');
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

      // Automatically Log in after signup
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

    // setters
    setIsSignup,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirm,

    // actions
    handleSubmit,
    resetForm,
    router,
  };
};
