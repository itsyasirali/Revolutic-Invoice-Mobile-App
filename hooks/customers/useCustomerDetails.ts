import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Alert } from 'react-native';
import { Customer } from '@/types/customer';
import { useCustomerDelete } from './useCustomerDelete';
import axios from '@/services/api';

export const useCustomerDetails = () => {
    const { customer } = useLocalSearchParams();
    const router = useRouter();
    const { deleteCustomer } = useCustomerDelete();

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

    const handleCall = (number?: string) => {
        if (number) Linking.openURL(`tel:${number}`);
        else Alert.alert('No Number', 'This customer does not have a phone number.');
    };

    const handleEmail = (email?: string) => {
        if (email) Linking.openURL(`mailto:${email}`);
        else Alert.alert('No Email', 'This customer does not have an email address.');
    };

    const handleStatusToggle = async () => {
        if (!customerData) return;
        const newStatus = customerData.status === 'Active' ? 'Inactive' : 'Active';

        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            formData.append('customerType', customerData.customerType || 'Business');
            formData.append('displayName', customerData.displayName || '');

            const res = await axios.put(`/api/customers/${customerData.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.customer) {
                setCustomerData(res.data.customer);
            }
        } catch (error: any) {
            console.error('Failed to update status:', error);
            Alert.alert('Error', 'Failed to update status');
        }
        setShowMenu(false);
    };


    const handleEditFormCancel = () => {
        setShowEditForm(false);
    };

    const handleCreateInvoice = (newInvoice: any) => {
        if (newInvoice && customerData) {
            const updatedInvoices = [newInvoice, ...(customerData.invoices || [])];
            setCustomerData({ ...customerData, invoices: updatedInvoices });
            Alert.alert('Success', 'Invoice created successfully');
        }
        setShowNewInvoiceForm(false);
    };

    const handleDelete = async () => {
        if (!customerData) return;
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const res = await deleteCustomer(customerData.id);
                    if (res.success) router.back();
                    else Alert.alert('Error', res.error || 'Delete failed');
                }
            }
        ]);
        setShowMenu(false);
    };

    // Derived sorted data for views
    const invoices = (customerData?.invoices || []).sort((a: any, b: any) => {
        const dateA = new Date(a.dueDate || a.invoiceDate || a.createdAt || a.date).getTime();
        const dateB = new Date(b.dueDate || b.invoiceDate || b.createdAt || b.date).getTime();
        return dateB - dateA;
    });

    const payments = (customerData?.payments || []).sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());


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
        handleDelete,
        handleEditFormCancel,
        router,
    };
};
