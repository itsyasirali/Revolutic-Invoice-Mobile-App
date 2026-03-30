import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Item } from '@/types/items';
import { useItemDelete } from './useItemDelete';
import axios from '@/services/api';

export const useItemDetails = () => {
    const { item } = useLocalSearchParams();
    const router = useRouter();
    const { deleteItem } = useItemDelete();

    const [itemData, setItemData] = useState<Item | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showCloneForm, setShowCloneForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [expandMoreInfo, setExpandMoreInfo] = useState(false);

    useEffect(() => {
        if (!item) return;
        try {
            const raw = Array.isArray(item) ? item[0] : item;
            const parsed: Item = JSON.parse(raw);
            setItemData(parsed);
        } catch (err) {
            console.error('Error parsing item data:', err);
        }
    }, [item]);

    const handleStatusToggle = async () => {
        if (!itemData) return;
        const newStatus = itemData.status === 'Active' ? 'inActive' : 'Active';

        try {
            const res = await axios.put(`/api/items/${itemData.id}`, { status: newStatus });
            if (res.data.item) {
                setItemData(res.data.item);
            }
        } catch (error: any) {
            console.error('Failed to update status:', error);
            Alert.alert('Error', 'Failed to update status');
        }
        setShowMenu(false);
    };

    const handleDelete = async () => {
        if (!itemData) return;
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const res = await deleteItem(itemData.id);
                    if (res.success) router.back();
                    else Alert.alert('Error', res.error || 'Delete failed');
                }
            }
        ]);
        setShowMenu(false);
    };

    return {
        // State
        itemData,
        showEditForm,
        showCloneForm,
        showMenu,
        expandMoreInfo,

        // Setters
        setShowEditForm,
        setShowCloneForm,
        setShowMenu,
        setExpandMoreInfo,
        setItemData,
        // Actions
        handleStatusToggle,
        handleDelete,
        router,
    };
};
