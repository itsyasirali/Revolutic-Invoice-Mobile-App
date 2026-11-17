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

    const greeting = 'Welcome,';

    const handleGoSettings = () => {
        router.push('/screens/settings');
    };

    return {
        userName,
        greeting,
        insets,
        handleGoSettings,
    };
};
