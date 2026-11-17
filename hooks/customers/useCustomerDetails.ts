import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Alert } from 'react-native';
import { Customer } from '@/types/customer';
import axios from '@/services/api';
import useCustomerDelete from './useCustomerDelete';
import { updateCustomerInCache } from './useCustomerList';

const useCustomerDetails = () => {
    const { customer } = useLocalSearchParams();
    const router = useRouter();

    const [customerData, setCustomerData] = useState<Customer | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'payments'>('details');
    const [showEditForm, setShowEditForm] = useState(false);
    const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [expandMoreInfo, setExpandMoreInfo] = useState(false);
    const [expandContacts, setExpandContacts] = useState(false);

    useEffect(() => {
        if (!customer) return;
        try {
            const raw = Array.isArray(customer) ? customer[0] : customer;
            const parsed: Customer = JSON.parse(raw);
            setCustomerData(parsed);
        } catch (err) {
            console.error('Error parsing customer data:', err);
        }
    }, [customer]);

    const currency = customerData?.currency || 'PKR';
    const firstContact = customerData?.contacts?.[0];

    const handleCall = useCallback((number?: string) => {
        if (number) Linking.openURL(`tel:${number}`);
        else Alert.alert('No Number', 'This customer does not have a phone number.');
    }, []);

    const handleEmail = useCallback((email?: string) => {
        if (email) Linking.openURL(`mailto:${email}`);
        else Alert.alert('No Email', 'This customer does not have an email address.');
    }, []);

    const handleStatusToggle = useCallback(async () => {
        if (!customerData) return;
        const makeActive = customerData.status !== 'Active';

        try {
            // Same endpoint the web list uses. A full PUT would also have to resend
            // every contact, and the server rejects it without at least one.
            await axios.put('/api/customers/batch-update', {
                customers: [customerData.id],
                status: makeActive ? 'active' : 'inactive',
            });
            const updated = { ...customerData, status: makeActive ? 'Active' : 'inActive' } as Customer;
            setCustomerData(updated);
            updateCustomerInCache(updated);
            Alert.alert('Success', `Customer marked as ${makeActive ? 'Active' : 'Inactive'}`);
        } catch (error: any) {
            console.error('Failed to update status:', error);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update status');
        }
        setShowMenu(false);
    }, [customerData]);

    // After an edit the details screen shows the saved customer straight away.
    const handleEditSuccess = useCallback((saved?: Customer) => {
        if (saved) setCustomerData((prev) => (prev ? { ...prev, ...saved } : saved));
        setShowEditForm(false);
    }, []);

    const handleEditFormCancel = useCallback(() => {
        setShowEditForm(false);
    }, []);

    const handleCreateInvoice = useCallback((newInvoice: any) => {
        if (newInvoice && customerData) {
            const updatedInvoices = [newInvoice, ...(customerData.invoices || [])];
            setCustomerData({ ...customerData, invoices: updatedInvoices });
            Alert.alert('Success', 'Invoice created successfully');
        }
        setShowNewInvoiceForm(false);
    }, [customerData]);

    // Derived sorted data for views
    const invoices = useMemo(() => {
        return [...(customerData?.invoices || [])].sort((a: any, b: any) => {
            const dateA = new Date(a.dueDate || a.invoiceDate || a.createdAt || a.date).getTime();
            const dateB = new Date(b.dueDate || b.invoiceDate || b.createdAt || b.date).getTime();
            return dateB - dateA;
        });
    }, [customerData?.invoices]);

    const payments = useMemo(() => {
        return [...(customerData?.payments || [])].sort(
            (a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
    }, [customerData?.payments]);

    const { deleteCustomer, deleteLoading } = useCustomerDelete();

    const handleDelete = useCallback(() => {
        if (!customerData) return;
        setShowMenu(false);
        Alert.alert(
            "Delete Customer",
            "Are you sure you want to delete this customer?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const res = await deleteCustomer(customerData.id);
                        if (res.success) {
                            router.back();
                        } else {
                            Alert.alert("Error", res.error || "Failed to delete customer");
                        }
                    },
                },
            ],
        );
    }, [customerData, deleteCustomer, router]);

    const handleOpenEdit = useCallback(() => setShowEditForm(true), []);
    const handleCloseEdit = useCallback(() => setShowEditForm(false), []);
    const handleOpenNewInvoice = useCallback(() => setShowNewInvoiceForm(true), []);
    const handleCloseNewInvoice = useCallback(() => setShowNewInvoiceForm(false), []);
    const handleOpenMenu = useCallback(() => setShowMenu(true), []);
    const handleCloseMenu = useCallback(() => setShowMenu(false), []);
    const handleNavigateBack = useCallback(() => router.back(), [router]);
    const toggleExpandMoreInfo = useCallback(() => setExpandMoreInfo(prev => !prev), []);
    const toggleExpandContacts = useCallback(() => setExpandContacts(prev => !prev), []);

    return {
        // State
        customerData,
        activeTab,
        showEditForm,
        showNewInvoiceForm,
        showMenu,
        expandMoreInfo,
        expandContacts,
        currency,
        firstContact,
        invoices,
        payments,
        deleteLoading,

        // Setters
        setActiveTab,
        setShowEditForm,
        setShowNewInvoiceForm,
        setShowMenu,
        setExpandMoreInfo,
        setExpandContacts,

        // Actions
        handleCall,
        handleEmail,
        handleStatusToggle,
        handleCreateInvoice,
        handleEditFormCancel,
        handleEditSuccess,
        handleDelete,
        handleOpenEdit,
        handleCloseEdit,
        handleOpenNewInvoice,
        handleCloseNewInvoice,
        handleOpenMenu,
        handleCloseMenu,
        handleNavigateBack,
        toggleExpandMoreInfo,
        toggleExpandContacts,
        router,
    };
};

export default useCustomerDetails;
