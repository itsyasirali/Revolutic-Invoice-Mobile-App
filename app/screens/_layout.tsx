import { Stack } from 'expo-router';

export default function ScreensLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="payments" />
            <Stack.Screen name="Invoice" />
            <Stack.Screen name="Items" />
            <Stack.Screen name="customer" />
        </Stack>
    );
}
