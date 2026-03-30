import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps, View, Text, ActivityIndicator, Pressable } from 'react-native';

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  onRefresh,
  refreshing = false,
  loading = false,
  error = null,
  children,
  ...props
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0891B2" />
        <Text className="mt-4 text-slate-500">
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-lg font-semibold text-center mb-2 text-red-600">
          Error
        </Text>
        <Text className="text-center mb-4 text-slate-500">
          {error}
        </Text>
        <Pressable
          onPress={handleRefresh}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#0891B2"
          colors={['#0891B2']}
          progressBackgroundColor="#f8fafc"
        />
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
