import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/api';
import { UIInvoiceListItem } from '@/types/invoice';

export const useInvoiceList = () => {
    const [invoices, setInvoices] = useState<UIInvoiceListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partially Paid'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
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

            setInvoices(mapped);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshInvoices = async () => {
        setRefreshing(true);
        await fetchInvoices();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchInvoices();
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
