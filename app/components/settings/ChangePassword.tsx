import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChangePasswordForm } from '@/hooks/settings/useChangePasswordForm';
import InputField from '../ui/InputField';
import StandardButton from '../ui/StandardButton';

const ChangePassword: React.FC = () => {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrent,
    showNew,
    toggleShowCurrent,
    toggleShowNew,
    saving,
    insets,
    handleBack,
    handleSave,
  } = useChangePasswordForm();

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 pb-2"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={handleBack}
          className="w-9 h-9 rounded-full items-center justify-center active:bg-slate-100 -ml-2"
        >
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-xl font-bold text-slate-800 ml-2">Change Password</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <InputField
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry={!showCurrent}
          rightIcon={
            <Pressable onPress={toggleShowCurrent}>
              <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </Pressable>
          }
        />

        <InputField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry={!showNew}
          rightIcon={
            <Pressable onPress={toggleShowNew}>
              <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </Pressable>
          }
        />

        <InputField
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter new password"
          secureTextEntry={!showNew}
        />

        <StandardButton
          onPress={handleSave}
          title="Update Password"
          loading={saving}
          className="mt-2 mb-8"
        />
      </ScrollView>
    </View>
  );
};

export default ChangePassword;
