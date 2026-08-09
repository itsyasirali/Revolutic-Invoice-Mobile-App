import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/auth/useProfile';
import { useProfileSettings } from '@/hooks/settings/useProfileSettings';
import InputField from '../ui/InputField';
import StandardButton from '../ui/StandardButton';

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const { user, loading, refetch } = useProfile();
  const { saving, updateProfile } = useProfileSettings();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    const result = await updateProfile({ name: name.trim(), email: email.trim() });
    if (result.success) {
      await refetch();
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } else {
      Alert.alert('Error', result.message || 'Failed to update profile');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 pb-2"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center active:bg-slate-100 -ml-2"
        >
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-xl font-bold text-slate-800 ml-2">Profile Information</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1AA3FF" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <InputField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <StandardButton
            onPress={handleSave}
            title="Save Changes"
            loading={saving}
            className="mt-2 mb-8"
          />
        </ScrollView>
      )}
    </View>
  );
};

export default ProfileSettings;
