import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/auth/useProfile';
import { useLogout } from '@/hooks/auth/useLogout';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
  loading?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, title, subtitle, onPress, danger, loading }) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress || loading}
    className="flex-row items-center px-4 py-3 active:bg-slate-50"
  >
    <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${danger ? 'bg-red-50' : 'bg-primary/10'}`}>
      <Ionicons name={icon} size={18} color={danger ? '#dc2626' : '#1AA3FF'} />
    </View>
    <View className="flex-1">
      <Text className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-slate-800'}`}>{title}</Text>
      <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>
    </View>
    {loading ? (
      <ActivityIndicator size="small" color="#9CA3AF" />
    ) : onPress ? (
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    ) : null}
  </Pressable>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View className="mb-6">
    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">{title}</Text>
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
      {children}
    </View>
  </View>
);

const Settings: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useProfile();
  const { logout, loading: loggingOut } = useLogout();
  const insets = useSafeAreaInsets();

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
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
        <Text className="text-xl font-bold text-slate-800 ml-2">Settings</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1AA3FF" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Profile card */}
          <Pressable
            onPress={() => router.push('/screens/settings/profile')}
            className="flex-row items-center bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 active:bg-slate-50"
          >
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-xl font-bold text-primary">{userInitial}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-800">{displayName}</Text>
              {user?.email ? (
                <Text className="text-xs text-slate-400 mt-0.5">{user.email}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>

          <SectionCard title="Account">
            <SettingsRow
              icon="person-outline"
              title="Profile Information"
              subtitle="Update your name, email and contact"
              onPress={() => router.push('/screens/settings/profile')}
            />
            <SettingsRow
              icon="briefcase-outline"
              title="Business Information"
              subtitle="Update your business details"
            />
            <SettingsRow
              icon="ribbon-outline"
              title="Subscription"
              subtitle="Manage your plan and billing"
            />
            <SettingsRow
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => router.push('/screens/settings/password')}
            />
          </SectionCard>

          <SectionCard title="Preferences">
            <SettingsRow icon="settings-outline" title="General Settings" subtitle="Manage general preferences" />
            <SettingsRow icon="document-text-outline" title="Invoice Settings" subtitle="Customize invoice preferences" />
            <SettingsRow icon="card-outline" title="Payment Settings" subtitle="Manage payment methods" />
            <SettingsRow icon="pricetag-outline" title="Tax Settings" subtitle="Configure tax rates and rules" />
            <SettingsRow icon="notifications-outline" title="Notifications" subtitle="Manage email and push notifications" />
          </SectionCard>

          <SectionCard title="Other">
            <SettingsRow icon="cloud-upload-outline" title="Backup & Export" subtitle="Backup your data and export" />
            <SettingsRow icon="shield-checkmark-outline" title="Data & Privacy" subtitle="Manage your data and privacy" />
            <SettingsRow icon="color-palette-outline" title="Appearance" subtitle="Choose theme and appearance" />
            <SettingsRow icon="globe-outline" title="Language" subtitle="Select your preferred language" />
          </SectionCard>

          <SectionCard title="">
            <SettingsRow
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out from your account"
              onPress={logout}
              loading={loggingOut}
              danger
            />
          </SectionCard>
        </ScrollView>
      )}
    </View>
  );
};

export default Settings;
