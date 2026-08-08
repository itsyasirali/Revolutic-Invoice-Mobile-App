import { Stack } from 'expo-router';

export default function PaymentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="email" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
