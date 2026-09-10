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

// In-memory module cache for instant zero-loader profile and settings opening
let cachedUser: User | null = null;
let hasFetchedProfileOnce = false;

export const updateCachedUser = (user: User | null) => {
    cachedUser = user;
    if (user) {
        hasFetchedProfileOnce = true;
    } else {
        hasFetchedProfileOnce = false;
    }
};

export const getCachedUser = () => cachedUser;

export const useProfile = (): UseProfileReturn => {
    const [user, setUser] = useState<User | null>(cachedUser);
    const [loading, setLoading] = useState<boolean>(!hasFetchedProfileOnce && cachedUser === null);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (opts?: { silent?: boolean }) => {
        try {
            if (!opts?.silent && cachedUser === null && !hasFetchedProfileOnce) {
                setLoading(true);
            }
            setError(null);

            const response = await axios.get('/api/auth/me');

            if (response.data?.user) {
                cachedUser = response.data.user;
                hasFetchedProfileOnce = true;
                setUser(response.data.user);
            } else {
                cachedUser = null;
                setUser(null);
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                cachedUser = null;
                hasFetchedProfileOnce = false;
                setUser(null);
            } else {
                setError(err.response?.data?.message || 'Failed to fetch user profile');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Silently revalidate in background if we already have cache
        fetchProfile({ silent: hasFetchedProfileOnce && cachedUser !== null });

        // Silent listener for auth changes
        const subscription = DeviceEventEmitter.addListener('auth.changed', () =>
            fetchProfile({ silent: true })
        );

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
