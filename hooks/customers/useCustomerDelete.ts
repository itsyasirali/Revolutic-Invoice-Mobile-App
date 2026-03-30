import { useState } from 'react';
import axios from '@/services/api';

export const useCustomerDelete = () => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    const deleteCustomer = async (id: string) => {
        setDeleteLoading(true);
        try {
            await axios.delete('/api/customers/batch-delete', { data: { customers: [id] } });
            setDeleteLoading(false);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to delete customer:', error);
            setDeleteLoading(false);
            return { success: false, error: error.response?.data?.message || 'Failed to delete customer' };
        }
    };

    return {
        deleteCustomer,
        deleteLoading
    };
};
