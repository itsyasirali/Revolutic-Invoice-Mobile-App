import { useProfile } from './useProfile';

export const useAuth = () => {
    const { user, loading, refetch } = useProfile();

    return {
        user,
        loading,
        refreshAuth: refetch
    };
};
