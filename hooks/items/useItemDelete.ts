import { useState } from 'react';
import axios from '@/services/api';

export const useItemDelete = () => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    const deleteItem = async (id: string) => {
        setDeleteLoading(true);
        try {
            await axios.delete(`/api/items/${id}`);
            setDeleteLoading(false);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to delete item:', error);
            setDeleteLoading(false);
            return { success: false, error: error.response?.data?.message || 'Failed to delete item' };
        }
    };

    return {
        deleteItem,
        deleteLoading
    };
};
