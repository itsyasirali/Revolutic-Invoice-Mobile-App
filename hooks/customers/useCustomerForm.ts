import { useState, useEffect, useMemo, useRef } from 'react';
import { Alert, TextInput } from 'react-native';
import { Customer, Contact, CustomerType } from '@/types/customer';
import currenciesData from '@/data/CurrencyData';
import axios from '@/services/api';

const buildCustomerFormData = (data: Partial<Customer>): FormData => {
    const formData = new FormData();
    const simpleFields = ['customerType', 'companyName', 'displayName', 'currency', 'address', 'remarks', 'status'];

    simpleFields.forEach(field => {
        if (data[field as keyof Customer]) {
            formData.append(field, data[field as keyof Customer] as string);
        }
    });

    if (data.contacts && Array.isArray(data.contacts)) {
        data.contacts.forEach((contact, index) => {
            if (contact.firstName) formData.append(`contacts[${index}].firstName`, contact.firstName);
            if (contact.lastName) formData.append(`contacts[${index}].lastName`, contact.lastName);
            if (contact.email) formData.append(`contacts[${index}].email`, contact.email);
            if (contact.contact) formData.append(`contacts[${index}].contact`, contact.contact);
        });
    }

    return formData;
};

export const useCustomerForm = (customer?: Customer | null, onSaveSuccess?: () => void) => {
    const isEditing = !!customer;

    // Form State
    const [customerType, setCustomerType] = useState<CustomerType>('Business');
    const [companyName, setCompanyName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [address, setAddress] = useState('');
    const [remarks, setRemarks] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Contact Input State
    const [contactFirstName, setContactFirstName] = useState('');
    const [contactLastName, setContactLastName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [currencyQuery, setCurrencyQuery] = useState('');
    const currencyInputRef = useRef<TextInput>(null);

    // Initialize form with customer data if editing
    useEffect(() => {
        if (customer) {
            setCustomerType(customer.customerType);
            setCompanyName(customer.companyName || '');
            setDisplayName(customer.displayName || '');
            setCurrency(customer.currency || 'USD');
            setAddress(customer.address || '');
            setRemarks(customer.remarks || '');
            setContacts(customer.contacts || []);
        }
    }, [customer]);

    // Currency Dropdown Logic
    useEffect(() => {
        const sel = currenciesData.find((c) => c.code === currency);
        setCurrencyQuery(sel ? `${sel.code} — ${sel.name}` : '');
    }, [currency]);

    const filteredCurrencies = useMemo(() => {
        const q = currencyQuery.trim().toLowerCase();
        if (!q) return currenciesData;
        return currenciesData.filter(
            (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
        );
    }, [currencyQuery]);

    const handleCurrencySelect = (code: string) => {
        setCurrency(code);
        setShowCurrencyDropdown(false);
    };

    // Contact Logic
    const addContact = () => {
        if (contactFirstName || contactLastName || contactEmail || contactPhone) {
            setContacts((prev) => [
                ...prev,
                {
                    firstName: contactFirstName,
                    lastName: contactLastName,
                    email: contactEmail,
                    contact: contactPhone,
                },
            ]);
            // Reset inputs
            setContactFirstName('');
            setContactLastName('');
            setContactEmail('');
            setContactPhone('');
        }
    };

    const removeContact = (index: number) => {
        setContacts((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRequest = async (
        method: 'post' | 'put',
        url: string,
        data: Partial<Customer>,
        isUpdate = false
    ) => {
        try {
            setLoading(true);
            const formData = buildCustomerFormData(data);
            const res = await axios[method](url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { success: true, customer: res.data.customer };
        } catch (error: any) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} customer:`, error);
            return { success: false, error: error.response?.data?.message || `Failed to ${isUpdate ? 'update' : 'create'} customer` };
        } finally {
            setLoading(false);
        }
    };

    const createCustomer = (data: Partial<Customer>) => handleRequest('post', '/api/customers', data);
    const updateCustomer = (id: string, data: Partial<Customer>) => handleRequest('put', `/api/customers/${id}`, data, true);

    // Submit Logic
    const handleSubmit = async () => {
        if (!customerType) return Alert.alert('Error', 'Please select customer type');
        if (!displayName || displayName.trim().length === 0) return Alert.alert('Error', 'Display name is required');
        if (customerType === 'Business' && !companyName) return Alert.alert('Error', 'Company name is required for business customers');

        // setLoading(true); // Handled in handleRequest

        const payload: Partial<Customer> = {
            customerType,
            companyName: customerType === 'Business' ? companyName : undefined,
            displayName,
            currency,
            address,
            remarks,
            contacts,
        };

        let result;
        if (isEditing && customer?.id) {
            result = await updateCustomer(customer.id, payload);
        } else {
            result = await createCustomer(payload);
        }

        // setLoading(false); // Handled in handleRequest

        if (result.success) {
            Alert.alert('Success', isEditing ? 'Customer updated successfully' : 'Customer created successfully');
            if (onSaveSuccess) onSaveSuccess();
        } else {
            Alert.alert('Error', result.error || 'Failed to save customer');
        }
    };

    return {
        // State
        isEditing,
        customerType,
        companyName,
        displayName,
        currency,
        address,
        remarks,
        contacts,
        contactFirstName,
        contactLastName,
        contactEmail,
        contactPhone,
        loading,
        showCurrencyDropdown,
        currencyQuery,
        filteredCurrencies,
        currencyInputRef,

        // Setters
        setCustomerType,
        setCompanyName,
        setDisplayName,
        setCurrency,
        setAddress,
        setRemarks,
        setContactFirstName,
        setContactLastName,
        setContactEmail,
        setContactPhone,
        setCurrencyQuery,
        setShowCurrencyDropdown,

        // Actions
        handleCurrencySelect,
        addContact,
        removeContact,
        handleSubmit,
    };
};
