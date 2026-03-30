import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/api';
import { Payment } from '@/types/Payment';

export const usePaymentList = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPayments = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter.toLowerCase());

            const response = await axios.get(`/api/payments?${params.toString()}`);
            const paymentsData = Array.isArray(response.data) ? response.data : (response.data.payments || []);
            setPayments(paymentsData);
        } catch (err) {
            setError('Failed to fetch payments');
            console.error('Error fetching payments:', err);
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    }, [filter]);

    const refreshPayments = async () => {
        await fetchPayments(true);
    };

    const handleSaveSuccess = async () => {
        await refreshPayments();
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingPayment(null);
    };

    const handleEditPayment = (payment: Payment) => {
        setEditingPayment(payment);
        setShowEditForm(true);
    };

    // Derived state for filtered payments (client-side search)
    const filteredPayments = payments.filter((payment) => {
        const search = searchQuery.toLowerCase();
        const customerName = (payment.customer?.displayName || payment.customer?.companyName || payment.customer?.firstName || '').toLowerCase();
        const reference = (payment.reference || '').toLowerCase();
        const status = (payment.status || '').toLowerCase();
        const mode = (payment.paymentMode || payment.paymentMethod || '').toLowerCase();

        return (
            customerName.includes(search) ||
            reference.includes(search) ||
            status.includes(search) ||
            mode.includes(search)
        );
    });

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    return {
        payments: filteredPayments, // Return filtered list
        allPayments: payments, // Return raw list if needed
        loading,
        refreshing,
        error,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        refreshPayments,
        fetchPayments,
        showAddForm,
        setShowAddForm,
        showEditForm,
        setShowEditForm,
        editingPayment,
        setEditingPayment,
        formLoading,
        setFormLoading, // Kept for compatibility, though likely unused by form now
        handleSaveSuccess,
        handleEditPayment
    };
};
