import { useState } from 'react';
import axios from '@/services/api';

export const usePaymentDelete = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePayment = async (id: string) => {
        if (!id) return { success: false, error: 'No payment ID' };

        try {
            setLoading(true);
            setError(null);
            // Use relative path with configured axios (baseURL handles IP)
            await axios.delete(`/api/payments/${id}`);
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting payment:', err);
            const errorMessage = err.response?.data?.message || 'Failed to delete payment';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { deletePayment, loading, error };
};

export default usePaymentDelete;
