import { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import axios from '@/services/api';

interface User {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    companyName?: string;
}

interface UseProfileReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/auth/me');

            if (response.data?.user) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (err: any) {
            setUser(null);
            if (err.response?.status !== 401) {
                setError(err.response?.data?.message || 'Failed to fetch user profile');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();

        const subscription = DeviceEventEmitter.addListener('auth.changed', fetchProfile);

        return () => {
            subscription.remove();
        };
    }, []);

    return {
        user,
        loading,
        error,
        refetch: fetchProfile,
    };
};
