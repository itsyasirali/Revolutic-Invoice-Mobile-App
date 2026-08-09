import { Stack } from 'expo-router';
import { View } from 'react-native';
import BottomNav from '../components/layout/BottomNav';

export default function ScreensLayout() {
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="home" />
                    <Stack.Screen name="payments" />
                    <Stack.Screen name="Invoice" />
                    <Stack.Screen name="Items" />
                    <Stack.Screen name="customer" />
                    <Stack.Screen name="settings" />
                </Stack>
            </View>
            <BottomNav />
        </View>
    );
}
