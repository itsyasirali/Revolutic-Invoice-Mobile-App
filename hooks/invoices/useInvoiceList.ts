import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/api';
import { UIInvoiceListItem } from '@/types/invoice';

// Module-level in-memory cache to guarantee zero-loader screen switches
let invoiceCache: UIInvoiceListItem[] = [];
let hasFetchedInvoicesOnce = false;

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updateInvoiceInCache = (invoice: UIInvoiceListItem) => {
    const idx = invoiceCache.findIndex(i => i.id === invoice.id);
    if (idx >= 0) {
        invoiceCache = [...invoiceCache.slice(0, idx), invoice, ...invoiceCache.slice(idx + 1)];
    } else {
        invoiceCache = [invoice, ...invoiceCache];
    }
};

export const removeInvoiceFromCache = (id: string) => {
    invoiceCache = invoiceCache.filter(i => i.id !== id);
};

export const useInvoiceList = () => {
    // Instant initialization from memory cache
    const [invoices, setInvoices] = useState<UIInvoiceListItem[]>(invoiceCache);
    // Loader is ONLY shown on cold first launch when cache is completely empty
    const [loading, setLoading] = useState<boolean>(!hasFetchedInvoicesOnce && invoiceCache.length === 0);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partially Paid'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);

    const fetchInvoices = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (!hasFetchedInvoicesOnce && invoiceCache.length === 0) {
                setLoading(true);
            }

            const response = await axios.get('/api/invoices');
            const data = Array.isArray(response.data) ? response.data : response.data.invoices || [];

            const mapped = data.map((inv: any) => ({
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

            invoiceCache = mapped;
            hasFetchedInvoicesOnce = true;
            setInvoices(mapped);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refreshInvoices = async () => {
        await fetchInvoices(true);
    };

    useEffect(() => {
        // Silently fetch and sync data in background (SWR)
        fetchInvoices(false);
    }, [fetchInvoices]);

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

        // Actions
        refreshInvoices,
        refetch: fetchInvoices,

        // UI State & Actions
        showAddForm,
        setShowAddForm,
        showEditForm,
        setShowEditForm,
        editingInvoice,
        setEditingInvoice,
        handleEdit,
        handleCancel
    };
};
