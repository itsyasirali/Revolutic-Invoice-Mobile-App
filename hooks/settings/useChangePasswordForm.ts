import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useProfileSettings from '@/hooks/settings/useProfileSettings';

export const useChangePasswordForm = () => {
    const router = useRouter();
    const { saving, changePassword } = useProfileSettings();
    const insets = useSafeAreaInsets();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const toggleShowCurrent = () => {
        setShowCurrent(prev => !prev);
    };

    const toggleShowNew = () => {
        setShowNew(prev => !prev);
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/screens/settings');
        }
    };

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const result = await changePassword({ currentPassword, newPassword });
        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            Alert.alert('Success', 'Password updated successfully');
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/screens/settings');
            }
        } else {
            Alert.alert('Error', result.message || 'Failed to change password');
        }
    };

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        showCurrent,
        showNew,
        toggleShowCurrent,
        toggleShowNew,
        saving,
        insets,
        handleBack,
        handleSave,
    };
};
