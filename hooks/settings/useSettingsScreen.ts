import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/auth/useProfile';
import { useLogout } from '@/hooks/auth/useLogout';

export const useSettingsScreen = () => {
    const router = useRouter();
    const { user, loading } = useProfile();
    const { logout, loading: loggingOut } = useLogout();
    const insets = useSafeAreaInsets();

    const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
    const userInitial = displayName.charAt(0).toUpperCase();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/screens/home');
        }
    };

    const handleGoProfile = () => {
        router.push('/screens/settings/profile');
    };

    const handleGoPassword = () => {
        router.push('/screens/settings/password');
    };

    const handleLogout = () => {
        logout();
    };

    return {
        user,
        loading,
        loggingOut,
        displayName,
        userInitial,
        insets,
        handleBack,
        handleGoProfile,
        handleGoPassword,
        handleLogout,
    };
};
