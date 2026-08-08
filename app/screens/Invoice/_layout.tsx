import { Stack } from 'expo-router';

export default function InvoiceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="invoices" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="email" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
