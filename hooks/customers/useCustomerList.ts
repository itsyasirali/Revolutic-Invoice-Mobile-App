import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Customer } from '@/types/customer';
import axios from '@/services/api';

export const useCustomerList = () => {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/customers');
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const filteredCustomers = filter.toLowerCase() === 'all'
        ? customers
        : customers.filter(c => c.status?.toLowerCase() === filter.toLowerCase());

    const handleCustomerPress = (customer: Customer) => {
        router.push({
            pathname: '/screens/customer/customer-details',
            params: { customer: JSON.stringify(customer) },
        });
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
    };

    const displayCustomers = filteredCustomers.filter((c) => {
        const search = searchQuery.toLowerCase();
        const displayName = c.displayName ?? '';
        const companyName = c.companyName ?? '';
        const email = c.email ?? '';

        return (
            displayName.toLowerCase().includes(search) ||
            companyName.toLowerCase().includes(search) ||
            email.toLowerCase().includes(search)
        );
    });

    return {
        // State
        customers,
        loading,
        filter,
        showAddForm,
        searchQuery,
        displayCustomers,

        // Setters
        setFilter,
        setShowAddForm,
        setSearchQuery,

        // Actions
        refetch: fetchCustomers,
        handleCustomerPress,
        handleCancelAdd,
    };
};

