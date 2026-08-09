import React from 'react';
import { View, Text, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/auth/useProfile';
import { useLogout } from '@/hooks/auth/useLogout';

const Settings: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useProfile();
  const { logout, loading: loggingOut } = useLogout();

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center active:bg-slate-100 -ml-2"
        >
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-xl font-bold text-slate-800 ml-2">Settings</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1AA3FF" />
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          {/* Profile card */}
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-3">
              <Text className="text-3xl font-bold text-primary">{userInitial}</Text>
            </View>
            <Text className="text-lg font-bold text-slate-800">{displayName}</Text>
            {user?.email ? (
              <Text className="text-sm text-slate-500 mt-1">{user.email}</Text>
            ) : null}
            {user?.companyName ? (
              <Text className="text-xs text-slate-400 mt-1">{user.companyName}</Text>
            ) : null}
          </View>

          {/* Logout */}
          <Pressable
            onPress={logout}
            disabled={loggingOut}
            className="flex-row items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-red-50 items-center justify-center">
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              </View>
              <Text className="text-base font-semibold text-red-600">Logout</Text>
            </View>
            {loggingOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Settings;
