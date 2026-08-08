import { Stack } from 'expo-router';

export default function ItemsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="items" />
      <Stack.Screen name="ItemDetails" />
    </Stack>
  );
}
