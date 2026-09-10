import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Item } from '@/types/items';
import axios from '@/services/api';

// Module-level in-memory cache to guarantee zero-loader screen switches
let itemCache: Item[] = [];
let hasFetchedItemsOnce = false;

// Cache mutation helpers for instant in-place updates without refetch flicker
export const updateItemInCache = (item: Item) => {
    const idx = itemCache.findIndex(i => i.id === item.id);
    if (idx >= 0) {
        itemCache = [...itemCache.slice(0, idx), item, ...itemCache.slice(idx + 1)];
    } else {
        itemCache = [item, ...itemCache];
    }
};

export const removeItemFromCache = (id: string) => {
    itemCache = itemCache.filter(i => i.id !== id);
};

export const useItemList = () => {
    const router = useRouter();
    // Instant initialization from memory cache
    const [items, setItems] = useState<Item[]>(itemCache);
    // Loader is ONLY shown on cold first launch when cache is completely empty
    const [loading, setLoading] = useState<boolean>(!hasFetchedItemsOnce && itemCache.length === 0);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchItems = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else if (!hasFetchedItemsOnce && itemCache.length === 0) {
            setLoading(true);
        }

        try {
            const response = await axios.get('/api/items');
            const itemsData = response.data?.items || response.data || [];
            const safeData = Array.isArray(itemsData) ? itemsData : [];
            itemCache = safeData;
            hasFetchedItemsOnce = true;
            setItems(safeData);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Silently fetch and sync data in background (SWR)
        fetchItems(false);
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

        return (
            name.toLowerCase().includes(search) ||
            description.toLowerCase().includes(search)
        );
    });

    return {
        // State
        items,
        loading,
        refreshing,
        filter,
        showAddForm,
        searchQuery,
        displayItems,

        // Setters
        setFilter,
        setShowAddForm,
        setSearchQuery,

        // Actions
        refetch: () => fetchItems(true),
        handleItemPress,
        handleCancelAdd,
    };
};
