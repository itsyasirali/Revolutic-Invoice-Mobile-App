import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Customer } from '@/types/customer';
import axios from '@/services/api';

// Module-level in-memory cache to guarantee zero-loader screen switches
let customerCache: Customer[] = [];
let hasFetchedCustomersOnce = false;
let lastCustomersFetchAt = 0;
const FRESH_MS = 30_000;

// Screens showing the list subscribe here, so a change made anywhere (details,
// edit form, delete) appears at once without a manual refresh.
const listeners = new Set<(list: Customer[]) => void>();
const publish = () => listeners.forEach((fn) => fn(customerCache));

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updateCustomerInCache = (customer: Customer) => {
    lastCustomersFetchAt = 0; // next visit re-syncs with the server
    const idx = customerCache.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
        // Merge: the server reply can omit computed fields such as receivables.
        const merged = { ...customerCache[idx], ...customer };
        customerCache = [...customerCache.slice(0, idx), merged, ...customerCache.slice(idx + 1)];
    } else {
        customerCache = [customer, ...customerCache];
    }
    publish();
};

export const removeCustomerFromCache = (id: string) => {
    customerCache = customerCache.filter(c => c.id !== id);
    publish();
};

const useCustomerList = () => {
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
            lastCustomersFetchAt = Date.now();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        listeners.add(setCustomers);
        return () => {
            listeners.delete(setCustomers);
        };
    }, []);

    useEffect(() => {
        // Silently sync in the background, but skip it while the cache is fresh.
        if (Date.now() - lastCustomersFetchAt > FRESH_MS) fetchCustomers(false);
    }, [fetchCustomers]);

    const filteredCustomers = useMemo(() => {
        return filter.toLowerCase() === 'all'
            ? customers
            : customers.filter(c => c.status?.toLowerCase() === filter.toLowerCase());
    }, [filter, customers]);

    const handleCustomerPress = useCallback((customer: Customer) => {
        router.push({
            pathname: '/screens/customer/customer-details',
            params: { customer: JSON.stringify(customer) },
        });
    }, [router]);

    const handleCancelAdd = useCallback(() => {
        setShowAddForm(false);
    }, []);

    const displayCustomers = useMemo(() => {
        const search = searchQuery.toLowerCase().trim();
        if (!search) return filteredCustomers;

        return filteredCustomers.filter(c => {
            const displayName = c.displayName ?? '';
            const companyName = c.companyName ?? '';
            const email = c.email ?? '';

            return (
                displayName.toLowerCase().includes(search) ||
                companyName.toLowerCase().includes(search) ||
                email.toLowerCase().includes(search)
            );
        });
    }, [filteredCustomers, searchQuery]);

    const handleOpenAdd = useCallback(() => {
        setShowAddForm(true);
    }, []);

    const handleSaveSuccess = useCallback(() => {
        setShowAddForm(false);
        fetchCustomers(true);
    }, [fetchCustomers]);

    const filterTabs = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
    ] as const;

    return {
        // State
        customers,
        loading,
        refreshing,
        filter,
        showAddForm,
        searchQuery,
        displayCustomers,
        filterTabs,

        // Setters
        setFilter,
        setShowAddForm,
        setSearchQuery,

        // Actions
        refetch: () => fetchCustomers(true),
        fetchCustomers,
        handleCustomerPress,
        handleCancelAdd,
        handleOpenAdd,
        handleSaveSuccess,
    };
};

export default useCustomerList;



