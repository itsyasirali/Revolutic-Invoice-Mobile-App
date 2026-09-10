import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/auth/useProfile';

export const useDashboardHeader = (customUserName?: string) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useProfile();

    const userName =
        customUserName ||
        user?.firstName ||
        (user?.name ? user.name.split(' ')[0] : 'User');

    const userInitial = userName.charAt(0).toUpperCase();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return 'Good morning,';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon,';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening,';
        } else {
            return 'Good night,';
        }
    }, []);

    const handleGoSettings = () => {
        router.push('/screens/settings');
    };

    const handleGoProfile = () => {
        router.push('/screens/settings/profile');
    };

    return {
        userName,
        userInitial,
        greeting,
        insets,
        handleGoSettings,
        handleGoProfile,
    };
};
