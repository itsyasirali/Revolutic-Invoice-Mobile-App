import { useState } from 'react';
import { getInvoiceStatusStyle } from '@/utils/invoiceStatus';
import { useRouter } from 'expo-router';
import useSWR, { mutate as globalMutate } from 'swr';
import axios from '@/services/api';
import { UIInvoiceListItem } from '@/types/invoice';

// One shared SWR key: every hook/component that lists invoices (the dashboard
// alone uses it six times) shares a single cached request.
export const INVOICES_KEY = '/api/invoices';

const fetchInvoices = async (): Promise<UIInvoiceListItem[]> => {
    const response = await axios.get(INVOICES_KEY);
    const data = Array.isArray(response.data) ? response.data : response.data.invoices || [];
    return data.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.displayName || inv.customerDisplayName || inv.customerId?.displayName || inv.customerName || 'Unknown',
        date: inv.invoiceDate,
        dueDate: inv.dueDate,
        amount: inv.total || 0,
        currency: inv.currency || 'PKR',
        status: inv.status || 'Draft',
        raw: inv
    }));
};

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updateInvoiceInCache = (invoice: UIInvoiceListItem) =>
    globalMutate(
        INVOICES_KEY,
        (current: UIInvoiceListItem[] | undefined) => {
            const list = current ?? [];
            const idx = list.findIndex(i => i.id === invoice.id);
            return idx >= 0 ? [...list.slice(0, idx), invoice, ...list.slice(idx + 1)] : [invoice, ...list];
        },
        { revalidate: false },
    );

export const removeInvoiceFromCache = (id: string) =>
    globalMutate(
        INVOICES_KEY,
        (current: UIInvoiceListItem[] | undefined) => (current ?? []).filter(i => i.id !== id),
        { revalidate: false },
    );

export const INVOICE_FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'Draft', label: 'Draft' },
    { key: 'Sent', label: 'Sent' },
    { key: 'Paid', label: 'Paid' },
    { key: 'Partially Paid', label: 'Partially Paid' },
    { key: 'Overdue', label: 'Overdue' },
    { key: 'Cancelled', label: 'Cancelled' },
] as const;

export { getInvoiceStatusStyle };

export const useInvoiceList = () => {
    const router = useRouter();
    const { data, isLoading, mutate } = useSWR<UIInvoiceListItem[]>(INVOICES_KEY, fetchInvoices, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        onError: (error) => console.error('Failed to fetch invoices:', error),
    });
    const invoices = data ?? [];
    // Loader only on a cold first load, when nothing is cached yet
    const loading = isLoading && !data;
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partially Paid'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);

    const refreshInvoices = async () => {
        setRefreshing(true);
        try {
            await mutate();
        } finally {
            setRefreshing(false);
        }
    };

    const filteredInvoices = invoices.filter((inv) => {
        const matchesFilter = filter === 'all' || inv.status === filter; // Exact match for status
        const search = searchQuery.toLowerCase();
        const matchesSearch =
            inv.invoiceNumber?.toLowerCase().includes(search) ||
            inv.customerName?.toLowerCase().includes(search) ||
            inv.status?.toLowerCase().includes(search);

        return matchesFilter && matchesSearch;
    });

    const handleEdit = (invoice: any) => {
        setEditingInvoice(invoice);
        setShowEditForm(true);
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingInvoice(null);
    };

    const handleOpenAdd = () => {
        setShowAddForm(true);
    };

    const handleSaveSuccess = () => {
        handleCancel();
        refreshInvoices();
    };

    const handleInvoicePress = (item: UIInvoiceListItem) => {
        const invoice = item as any;
        const templateData = (invoice.raw?.templateId && typeof invoice.raw.templateId === 'object') ? invoice.raw.templateId : null;
        router.push({
            pathname: "/screens/Invoice/detail",
            params: {
                invoiceData: JSON.stringify(invoice.raw || invoice),
                template: templateData ? JSON.stringify(templateData) : undefined
            }
        });
    };

    return {
        // Data
        invoices: filteredInvoices,
        allInvoices: invoices,
        loading,
        refreshing,

        // Filter & Search
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        filterTabs: INVOICE_FILTER_TABS,

        // Actions
        refreshInvoices,
        refetch: () => mutate(),
        getStatusStyle: getInvoiceStatusStyle,

        // UI State & Actions
        showAddForm,
        setShowAddForm,
        showEditForm,
        setShowEditForm,
        editingInvoice,
        setEditingInvoice,
        handleEdit,
        handleCancel,
        handleOpenAdd,
        handleSaveSuccess,
        handleInvoicePress,
    };
};

