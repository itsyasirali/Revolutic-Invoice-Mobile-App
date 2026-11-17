import { useState } from 'react';
import { useRouter } from 'expo-router';
import useSWR, { mutate as globalMutate } from 'swr';
import axios from '@/services/api';
import { Payment } from '@/types/Payment';

const paymentsKey = (filter: string) => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.append('status', filter.toLowerCase());
    return `/api/payments?${params.toString()}`;
};

const fetchPayments = async (key: string): Promise<Payment[]> => {
    const response = await axios.get(key);
    return Array.isArray(response.data) ? response.data : (response.data.payments || []);
};

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updatePaymentInCache = (payment: Payment) =>
    globalMutate(
        paymentsKey('all'),
        (current: Payment[] | undefined) => {
            const list = current ?? [];
            const idx = list.findIndex(p => p.id === payment.id);
            return idx >= 0 ? [...list.slice(0, idx), payment, ...list.slice(idx + 1)] : [payment, ...list];
        },
        { revalidate: false },
    );

export const removePaymentFromCache = (id: string) =>
    globalMutate(
        paymentsKey('all'),
        (current: Payment[] | undefined) => (current ?? []).filter(p => p.id !== id),
        { revalidate: false },
    );

export const usePaymentList = () => {
    const [filter, setFilter] = useState<string>('all');
    // Same key => every caller (dashboard hooks, payments screen) shares one request.
    const { data, isLoading, error: swrError, mutate } = useSWR<Payment[]>(paymentsKey(filter), fetchPayments, {
        revalidateOnFocus: false,
        dedupingInterval: 30000,
    });
    const payments = data ?? [];
    // Loader is ONLY shown on cold first launch when nothing is cached
    const loading = isLoading && !data;
    const error = swrError ? 'Failed to fetch payments' : null;
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const refreshPayments = async () => {
        setRefreshing(true);
        try {
            await mutate();
        } finally {
            setRefreshing(false);
        }
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
        fetchPayments: () => mutate(),
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
