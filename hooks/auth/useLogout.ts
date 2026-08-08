import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, DeviceEventEmitter } from 'react-native';
import axios from '@/services/api';
import { clearStoredToken } from '@/utils/authToken';

export const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const logout = async () => {
        setLoading(true);
        try {
            await axios.post('/api/auth/logout');
            DeviceEventEmitter.emit('auth.changed');
            Alert.alert('Success', 'Logged out successfully');
            router.replace('/auth');
        } catch (error: any) {
            console.error('Logout failed:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to logout');
        } finally {
            await clearStoredToken();
            setLoading(false);
        }
    };

    return { logout, loading };
};
