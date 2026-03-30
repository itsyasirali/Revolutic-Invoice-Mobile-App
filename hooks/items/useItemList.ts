import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Item } from '@/types/items';
import axios from '@/services/api';

export const useItemList = () => {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/items');
            const itemsData = response.data?.items || response.data || [];
            setItems(Array.isArray(itemsData) ? itemsData : []);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Client-side filtering
    const filteredItems = filter === 'all'
        ? items
        : items.filter(c => c.status?.toLowerCase() === filter.toLowerCase());

    const handleItemPress = (item: Item) => {
        router.push({
            pathname: '/screens/Items/ItemDetails',
            params: { item: JSON.stringify(item) },
        });
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
    };

    const displayItems = filteredItems.filter((item) => {
        const search = searchQuery.toLowerCase();
        const name = item.name ?? '';
        const description = item.description ?? '';

        // Match Customer search logic
        return (
            name.toLowerCase().includes(search) ||
            description.toLowerCase().includes(search)
        );
    });

    return {
        // State
        items,
        loading,
        filter,
        showAddForm,
        searchQuery,
        displayItems,

        // Setters
        setFilter,
        setShowAddForm,
        setSearchQuery,

        // Actions
        refetch: fetchItems,
        handleItemPress,
        handleCancelAdd,
    };
};
