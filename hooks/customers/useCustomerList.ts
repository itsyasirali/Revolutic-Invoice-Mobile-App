import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Customer } from '@/types/customer';
import axios from '@/services/api';

// Module-level in-memory cache to guarantee zero-loader screen switches
let customerCache: Customer[] = [];
let hasFetchedCustomersOnce = false;

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updateCustomerInCache = (customer: Customer) => {
    const idx = customerCache.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
        customerCache = [...customerCache.slice(0, idx), customer, ...customerCache.slice(idx + 1)];
    } else {
        customerCache = [customer, ...customerCache];
    }
};

export const removeCustomerFromCache = (id: string) => {
    customerCache = customerCache.filter(c => c.id !== id);
};

export const useCustomerList = () => {
    const router = useRouter();
    // Instant initialization from memory cache
    const [customers, setCustomers] = useState<Customer[]>(customerCache);
    // Loader is ONLY shown on cold first launch when cache is completely empty
    const [loading, setLoading] = useState<boolean>(!hasFetchedCustomersOnce && customerCache.length === 0);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [filter, setFilter] = useState('all');

    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else if (!hasFetchedCustomersOnce && customerCache.length === 0) {
            setLoading(true);
        }

        try {
            const response = await axios.get('/api/customers');
            const data = response.data.customers || [];
            customerCache = data;
            hasFetchedCustomersOnce = true;
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Silently fetch and sync data in the background (SWR)
        fetchCustomers(false);
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
        refreshing,
        filter,
        showAddForm,
        searchQuery,
        displayCustomers,

        // Setters
        setFilter,
        setShowAddForm,
        setSearchQuery,

        // Actions
        refetch: () => fetchCustomers(true),
        handleCustomerPress,
        handleCancelAdd,
    };
};

