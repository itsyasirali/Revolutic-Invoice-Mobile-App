import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useNotifications, { formatTimeAgo, NotificationItem } from '@/hooks/notifications/useNotifications';
import DetailPageHeader from '../ui/DetailPageHeader';

const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const { items, loading, markAllRead } = useNotifications();
  // Counted from the highlighted rows so the number stays while the badge is already cleared.
  const newCount = items.filter((n) => n.unread).length;
  const opened = useRef(false);

  // Opening the screen counts as reading: clear the badge once per visit.
  useEffect(() => {
    if (!opened.current && !loading) {
      opened.current = true;
      markAllRead();
    }
  }, [loading, markAllRead]);

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/home'));

  const open = (n: NotificationItem) => {
    if (n.kind === 'invoice') {
      const template = n.raw?.templateId && typeof n.raw.templateId === 'object' ? n.raw.templateId : undefined;
      router.push({
        pathname: '/screens/Invoice/detail' as any,
        params: { invoiceData: JSON.stringify(n.raw), id: String(n.raw.id), template: template ? JSON.stringify(template) : undefined },
      });
    } else {
      router.push({ pathname: '/screens/payments/detail' as any, params: { payment: JSON.stringify(n.raw) } });
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <DetailPageHeader title="Notifications" onBack={handleBack} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1AA3FF" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            items.length > 0 ? (
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Recent activity{newCount > 0 ? ` • ${newCount} new` : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Ionicons name="notifications-off-outline" size={48} color="#94a3b8" />
              <Text className="text-lg mt-3 text-slate-500">You&apos;re all caught up</Text>
              <Text className="text-sm mt-1 text-slate-400 text-center px-8">
                New invoice and payment activity will show up here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => open(item)}
              className={`flex-row items-center bg-white rounded-md mb-3 p-4 border shadow-sm ${item.unread ? 'border-primary/30' : 'border-slate-100'}`}
            >
              <View className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${item.kind === 'payment' ? 'bg-emerald-50' : 'bg-primary/10'}`}>
                <Ionicons
                  name={item.kind === 'payment' ? 'cash-outline' : 'receipt-outline'}
                  size={20}
                  color={item.kind === 'payment' ? '#10b981' : '#1AA3FF'}
                />
              </View>
              <View className="flex-1 pr-2">
                <Text className={`text-base ${item.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                  {item.description}
                </Text>
                <Text className="text-[11px] text-slate-400 mt-1">{formatTimeAgo(item.time)}</Text>
              </View>
              {item.unread && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
