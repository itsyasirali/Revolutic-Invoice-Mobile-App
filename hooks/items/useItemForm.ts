import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Item } from '@/types/items';
import axios from '@/services/api';

export const useItemForm = (item?: Item | null, onSaveSuccess?: () => void) => {
    const isEditing = !!(item && item.id);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);

    // Initialize form
    useEffect(() => {
        if (item) {
            setName(item.name || '');
            setDescription(item.description || '');
            setUnit(item.unit || '');
            setSellingPrice(item.sellingPrice?.toString() || '');
        } else {
            setName('');
            setDescription('');
            setUnit('');
            setSellingPrice('');
        }
    }, [item]);

    const handleRequest = async (
        method: 'post' | 'put',
        url: string,
        data: Partial<Item>,
        isUpdate = false
    ) => {
        try {
            setLoading(true);
            const res = await axios[method](url, data);
            return { success: true, item: res.data.item };
        } catch (error: any) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} item:`, error);
            return { success: false, error: error.response?.data?.message || `Failed to ${isUpdate ? 'update' : 'create'} item` };
        } finally {
            setLoading(false);
        }
    };

    const createItem = (data: Partial<Item>) => handleRequest('post', '/api/items', data);
    const updateItem = (id: string, data: Partial<Item>) => handleRequest('put', `/api/items/${id}`, data, true);

    const handleSubmit = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Item name is required');
        if (!unit.trim()) return Alert.alert('Error', 'Unit is required');
        if (!sellingPrice.trim() || parseFloat(sellingPrice) <= 0) return Alert.alert('Error', 'Valid selling price is required');

        const payload: Partial<Item> = {
            name,
            description,
            unit,
            sellingPrice: parseFloat(sellingPrice),
        };

        let result;
        if (isEditing && item?.id) {
            result = await updateItem(item.id, payload);
        } else {
            result = await createItem(payload);
        }

        if (result.success) {
            Alert.alert('Success', isEditing ? 'Item updated successfully' : 'Item created successfully');
            if (onSaveSuccess) onSaveSuccess();
        } else {
            Alert.alert('Error', result.error || 'Failed to save item');
        }

        return result;
    };

    return {
        // State
        isEditing,
        name,
        description,
        unit,
        sellingPrice,
        loading,

        // Setters
        setName,
        setDescription,
        setUnit,
        setSellingPrice,

        // Actions
        handleSubmit,
    };
};
