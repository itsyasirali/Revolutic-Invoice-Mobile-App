import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/auth/useProfile';
import useProfileSettings from '@/hooks/settings/useProfileSettings';

export const useProfileSettingsForm = () => {
    const router = useRouter();
    const { user, loading, refetch } = useProfile();
    const { saving, updateProfile } = useProfileSettings();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState(user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '');
    const [email, setEmail] = useState(user?.email || '');

    useEffect(() => {
        if (user) {
            setName(user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/screens/settings');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        const result = await updateProfile({ name: name.trim(), email: email.trim() });
        if (result.success) {
            await refetch();
            Alert.alert('Success', 'Profile updated successfully');
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/screens/settings');
            }
        } else {
            Alert.alert('Error', result.message || 'Failed to update profile');
        }
    };

    return {
        user,
        loading,
        saving,
        name,
        setName,
        email,
        setEmail,
        insets,
        handleBack,
        handleSave,
    };
};
