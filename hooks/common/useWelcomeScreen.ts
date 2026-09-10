import { useRouter } from 'expo-router';

export const useWelcomeScreen = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/auth');
    };

    return {
        handleGetStarted,
    };
};
