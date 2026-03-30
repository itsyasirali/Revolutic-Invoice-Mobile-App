import { useState } from 'react';
import axios from '@/services/api';
import { Alert } from 'react-native';

export const useInvoiceDelete = (onSuccess?: () => void) => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    const deleteInvoice = async (id: string) => {
        setDeleteLoading(true);
        try {
            await axios.delete(`/api/invoices/${id}`);
            if (onSuccess) onSuccess();
            return { success: true };
        } catch (error: any) {
            console.error('Failed to delete invoice:', error);
            Alert.alert("Error", error.response?.data?.message || "Failed to delete invoice");
            return { success: false, error: error.message };
        } finally {
            setDeleteLoading(false);
        }
    };

    return {
        deleteInvoice,
        deleteLoading
    };
};
