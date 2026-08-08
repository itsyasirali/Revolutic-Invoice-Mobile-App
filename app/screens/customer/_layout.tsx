import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer" />
      <Stack.Screen name="customer-details" />
    </Stack>
  );
}
