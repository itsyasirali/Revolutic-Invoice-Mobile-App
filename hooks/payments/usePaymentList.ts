import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import axios from '@/services/api';
import { Payment } from '@/types/Payment';

// Module-level in-memory cache to guarantee zero-loader screen switches
let paymentCache: Payment[] = [];
let hasFetchedPaymentsOnce = false;

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updatePaymentInCache = (payment: Payment) => {
    const idx = paymentCache.findIndex(p => p.id === payment.id);
    if (idx >= 0) {
        paymentCache = [...paymentCache.slice(0, idx), payment, ...paymentCache.slice(idx + 1)];
    } else {
        paymentCache = [payment, ...paymentCache];
    }
};

export const removePaymentFromCache = (id: string) => {
    paymentCache = paymentCache.filter(p => p.id !== id);
};

export const usePaymentList = () => {
    // Instant initialization from memory cache
    const [payments, setPayments] = useState<Payment[]>(paymentCache);
    // Loader is ONLY shown on cold first launch when cache is completely empty
    const [loading, setLoading] = useState<boolean>(!hasFetchedPaymentsOnce && paymentCache.length === 0);
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
            } else if (!hasFetchedPaymentsOnce && paymentCache.length === 0) {
                setLoading(true);
            }
            setError(null);

            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter.toLowerCase());

            const response = await axios.get(`/api/payments?${params.toString()}`);
            const paymentsData = Array.isArray(response.data) ? response.data : (response.data.payments || []);
            paymentCache = paymentsData;
            hasFetchedPaymentsOnce = true;
            setPayments(paymentsData);
        } catch (err) {
            setError('Failed to fetch payments');
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
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

    const router = useRouter();

    const filterTabs = [
        { key: 'all', label: 'All' },
        { key: 'Cash', label: 'Cash' },
        { key: 'Bank Transfer', label: 'Bank Transfer' },
        { key: 'Credit Card', label: 'Credit Card' },
        { key: 'Check', label: 'Check' },
        { key: 'Other', label: 'Other' },
    ];

    const getStatusStyle = (status: string) => {
        const normalizedStatus = (status || '').toLowerCase();
        switch (normalizedStatus) {
            case 'cash': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'cash' as const, hex: '#1AA3FF' };
            case 'bank transfer': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'business' as const, hex: '#1AA3FF' };
            case 'credit card': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'card' as const, hex: '#1AA3FF' };
            case 'check': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'document-text' as const, hex: '#1AA3FF' };
            case 'other': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'pricetag' as const, hex: '#1AA3FF' };
            default: return { bg: 'bg-primary/10', text: 'text-primary', icon: 'help-circle' as const, hex: '#1AA3FF' };
        }
    };

    const getCustomerName = (payment: any) => {
        if (payment.customer) {
            return payment.customer.displayName || payment.customer.companyName || payment.customer.firstName || 'Unknown Customer';
        }
        return 'Unknown Customer';
    };

    const handleOpenAdd = () => {
        setShowAddForm(true);
    };

    const handleCloseAdd = () => {
        setShowAddForm(false);
    };

    const handleCloseEdit = () => {
        setShowEditForm(false);
        setEditingPayment(null);
    };

    const handlePaymentPress = (payment: Payment) => {
        router.push({
            pathname: "/screens/payments/detail",
            params: { payment: JSON.stringify(payment) }
        });
    };

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
        handleEditPayment,
        filterTabs,
        getStatusStyle,
        getCustomerName,
        handleOpenAdd,
        handleCloseAdd,
        handleCloseEdit,
        handlePaymentPress,
    };
};
