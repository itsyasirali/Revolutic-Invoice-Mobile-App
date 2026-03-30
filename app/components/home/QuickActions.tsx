import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from '@/services/api';

// UI
import StandardModal from '../ui/StandardModal';

// Forms
import CustomerForm from '../customers/CustomerForm';
import ItemForm from '../items/ItemForm';
import InvoiceForm from '../invoices/InvoiceForm';
import PaymentForm from '../payments/PaymentForm';

type ActionId = 'customer' | 'item' | 'invoice' | 'payment';

interface ActionItem {
    id: ActionId;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    bgColor: string;
    component: React.ComponentType<any>;
    title: string;
    apiEndpoint: string;
    successMessage: string;
}

const QuickActions: React.FC = () => {
    const [activeActionId, setActiveActionId] = useState<ActionId | null>(null);
    const [loading, setLoading] = useState(false);

    const actions: ActionItem[] = [
        {
            id: 'customer',
            label: 'New\nCustomer',
            icon: 'person-add',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            component: CustomerForm,
            title: 'New Customer',
            apiEndpoint: '/api/customers',
            successMessage: 'Customer created successfully'
        },
        {
            id: 'item',
            label: 'New\nItem',
            icon: 'inventory',
            color: '#ea580c',
            bgColor: '#fff7ed',
            component: ItemForm,
            title: 'New Item',
            apiEndpoint: '/api/items',
            successMessage: 'Item created successfully'
        },
        {
            id: 'invoice',
            label: 'New\nInvoice',
            icon: 'receipt-long',
            color: '#2563eb',
            bgColor: '#eff6ff',
            component: InvoiceForm,
            title: 'New Invoice',
            apiEndpoint: '/api/invoices',
            successMessage: 'Invoice created successfully'
        },
        {
            id: 'payment',
            label: 'Add\nPayment',
            icon: 'payments',
            color: '#7c3aed',
            bgColor: '#f5f3ff',
            component: PaymentForm,
            title: 'Record Payment',
            apiEndpoint: '/api/payments',
            successMessage: 'Payment recorded successfully'
        },
    ];

    const activeAction = actions.find(a => a.id === activeActionId);

    const handleOpenModal = (id: string) => {
        setActiveActionId(id as ActionId);
    };

    const handleCloseModal = () => {
        setActiveActionId(null);
    };

    const handleSave = async (data: any) => {
        if (!activeAction) return;

        setLoading(true);
        try {
            await axios.post(activeAction.apiEndpoint, data);
            if (activeAction.id === 'invoice') {
                Alert.alert('Success', activeAction.successMessage);
            }

            setLoading(false);
            handleCloseModal();
            return { success: true };
        } catch (error: any) {
            setLoading(false);
            const msg = error.response?.data?.message || `Failed to create ${activeAction.id}`;
            return { success: false, error: msg };
        }
    };

    return (
        <View className="bg-white p-5 rounded-2xl mb-5 shadow-sm elevation-2">
            <View className="flex-row justify-between">
                {actions.map((action, index) => (
                    <Pressable
                        key={index}
                        onPress={() => handleOpenModal(action.id)}
                        className="items-center"
                    >
                        <View
                            style={{ backgroundColor: action.bgColor }}
                            className="w-16 h-16 rounded-full justify-center items-center mb-2 relative"
                        >
                            <MaterialIcons name={action.icon} size={30} color={action.color} />
                            <View className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                                <MaterialIcons name="add-circle" size={16} color="#1e293b" />
                            </View>
                        </View>
                        <Text className="text-xs text-center text-slate-800 leading-4">
                            {action.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <StandardModal
                visible={!!activeAction}
                onClose={handleCloseModal}
                animationType="slide"
            >
                {activeAction && (
                    <activeAction.component
                        onSave={handleSave}
                        onCancel={handleCloseModal}
                        loading={loading}
                    />
                )}
            </StandardModal>
        </View>
    );
};

export default QuickActions;
