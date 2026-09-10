import { useState, useCallback } from 'react';
import axios from '@/services/api';
import { removeCustomerFromCache } from './useCustomerList';

const useCustomerDelete = () => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    const deleteCustomer = useCallback(async (id: string) => {
        if (!id) return { success: false, error: 'No customer ID provided' };

        setDeleteLoading(true);
        try {
            await axios.delete('/api/customers/batch-delete', { data: { customers: [id] } });
            removeCustomerFromCache(id);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to delete customer:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete customer',
            };
        } finally {
            setDeleteLoading(false);
        }
    }, []);

    return {
        deleteCustomer,
        deleteLoading,
    };
};

export default useCustomerDelete;

