import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettingsScreen } from '@/hooks/settings/useSettingsScreen';
import { useNotificationPrefs } from '@/hooks/settings/useNotificationPrefs';
import { useOrganization } from '@/context/OrganizationContext';
import AppSwitch from '../ui/AppSwitch';
import Avatar from '../ui/Avatar';

type IconName = keyof typeof Ionicons.glyphMap;

/** Coloured icon tile used on every row. */
const IconTile: React.FC<{ icon: IconName; color: string }> = ({ icon, color }) => (
  <View className="w-10 h-10 rounded-md items-center justify-center mr-3" style={{ backgroundColor: `${color}1A` }}>
    <Ionicons name={icon} size={20} color={color} />
  </View>
);

interface RowProps {
  icon: IconName;
  color?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  loading?: boolean;
  /** Trailing control instead of the chevron (e.g. a switch). */
  right?: React.ReactNode;
  disabled?: boolean;
  last?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, color = '#1AA3FF', title, subtitle, onPress, loading, right, disabled, last }) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress || loading || disabled}
    className={`flex-row items-center px-4 py-3.5 active:bg-slate-50 ${last ? '' : 'border-b border-slate-100'} ${disabled ? 'opacity-50' : ''}`}
  >
    <IconTile icon={icon} color={color} />
    <View className="flex-1 pr-2">
      <Text className="text-[15px] font-semibold text-slate-800">{title}</Text>
      {!!subtitle && <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>}
    </View>
    {loading ? (
      <ActivityIndicator size="small" color="#94a3b8" />
    ) : right ? (
      right
    ) : onPress ? (
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    ) : null}
  </Pressable>
);

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View className="mb-4">
    <View className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">{children}</View>
  </View>
);

const Settings: React.FC = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const { prefs, setPref } = useNotificationPrefs();
  const {
    user,
    loading,
    loggingOut,
    displayName,
    insets,
    handleBack,
    handleGoProfile,
    handleGoPassword,
    handleLogout,
  } = useSettingsScreen();

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: handleLogout },
    ]);

  return (
    <View className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 12 }}>
        <Pressable onPress={handleBack} className="w-9 h-9 rounded-full items-center justify-center active:bg-slate-200 -ml-2" hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-bold text-slate-800 ml-2">Settings</Text>
      </View>

      {loading && !user ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1AA3FF" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Profile */}
          <Pressable
            onPress={handleGoProfile}
            className="flex-row items-center bg-primary rounded-md shadow-sm p-4 mb-5 active:opacity-90"
          >
            <View className="mr-4">
              <Avatar image={user?.image} name={displayName} size={64} variant="white" ring />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-lg font-bold text-white" numberOfLines={1}>
                {displayName}
              </Text>
              {!!user?.email && (
                <Text className="text-xs text-white/80 mt-0.5" numberOfLines={1}>
                  {user.email}
                </Text>
              )}
              {!!organization?.name && (
                <View className="flex-row items-center self-start bg-white/20 rounded-full px-2.5 py-1 mt-2">
                  <Ionicons name="business-outline" size={12} color="#ffffff" />
                  <Text className="text-[11px] font-semibold text-white ml-1" numberOfLines={1}>
                    {organization.name}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>

          <Section>
            <Row icon="person-outline" color="#1AA3FF" title="Profile Information" subtitle="Update your name, email and contact" onPress={handleGoProfile} />
            <Row icon="lock-closed-outline" color="#6366f1" title="Change Password" subtitle="Update your account password" onPress={handleGoPassword} last />
          </Section>

          <Section>
            <Row
              icon="business-outline"
              color="#0ea5e9"
              title="Organizations"
              subtitle={organization?.name ? `Current: ${organization.name}` : 'Switch, view or add organizations'}
              onPress={() => router.push('/screens/organization' as any)}
              last
            />
          </Section>

          <Section>
            <Row
              icon="notifications-outline"
              color="#f59e0b"
              title="Enable notifications"
              subtitle={prefs.enabled ? 'Unread badge and activity feed are on' : 'Notifications are turned off'}
              onPress={() => setPref('enabled', !prefs.enabled)}
              right={<AppSwitch value={prefs.enabled} onValueChange={(v) => setPref('enabled', v)} />}
              last={!prefs.enabled}
            />
            {prefs.enabled && (
              <>
                <Row
                  icon="receipt-outline"
                  color="#1AA3FF"
                  title="Invoice activity"
                  subtitle="Paid, sent, overdue and drafts"
                  onPress={() => setPref('invoices', !prefs.invoices)}
                  right={<AppSwitch value={prefs.invoices} onValueChange={(v) => setPref('invoices', v)} />}
                />
                <Row
                  icon="cash-outline"
                  color="#10b981"
                  title="Payment activity"
                  subtitle="Payments you receive"
                  onPress={() => setPref('payments', !prefs.payments)}
                  right={<AppSwitch value={prefs.payments} onValueChange={(v) => setPref('payments', v)} />}
                  last
                />
              </>
            )}
          </Section>

          <Pressable
            onPress={confirmLogout}
            disabled={loggingOut}
            className={`h-12 rounded-md items-center justify-center bg-red-600 active:bg-red-700 ${loggingOut ? 'opacity-70' : ''}`}
          >
            {loggingOut ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-base">Logout</Text>}
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
};

export default Settings;
