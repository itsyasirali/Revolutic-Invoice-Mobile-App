import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from '@/services/api';
import useCustomerList from '@/hooks/customers/useCustomerList';
import { useItemList } from '@/hooks/items/useItemList';
import useTemplatesList from '@/hooks/templates/useTemplatesList';

export const useInvoiceForm = (initialData: any, onSaveSuccess?: (invoice: any) => void) => {
    const router = useRouter();
    const { customers } = useCustomerList();
    const { items: itemOptions } = useItemList();
    const { templates } = useTemplatesList();

    // Form State
    const [invoiceNumber, setInvoiceNumber] = useState<string>('00001');
    const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [customer, setCustomer] = useState<any | null>(null);
    const [templateId, setTemplateId] = useState<string>('');
    const [discountPercent, setDiscountPercent] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [items, setItems] = useState<any[]>([
        { id: 1, itemId: '', title: '', description: '', quantity: 1, rate: 0, amount: 0, unit: '' },
    ]);
    const [previousDue, setPreviousDue] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // Date Picker States
    const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    const isEditing = !!initialData?.id;

    // Dropdown options
    const customerOptions = useMemo(() => {
        return customers.map(c => ({
            label: c.displayName || c.companyName || 'Unknown Customer',
            value: c.id,
            sublabel: [c.companyName, c.email].filter(Boolean).join(' • ') || undefined,
        }));
    }, [customers]);

    const itemDropdownOptions = useMemo(() => {
        return itemOptions.map(i => ({
            label: i.name || 'Unnamed Item',
            value: i.id,
            sublabel: i.sellingPrice ? `Price: PKR ${i.sellingPrice} | Unit: ${i.unit || '-'}` : undefined,
        }));
    }, [itemOptions]);

    const templateOptions = useMemo(() => {
        return templates.map(t => ({
            label: t.name || 'Unnamed Template',
            value: t.id,
            sublabel: t.paperSize ? `Paper: ${t.paperSize} | ${t.orientation || 'portrait'}` : undefined,
        }));
    }, [templates]);

    // Initialize logic
    useEffect(() => {
        if (initialData && customers.length > 0) {
            setInvoiceNumber(initialData.invoiceNumber || '00001');
            setInvoiceDate(initialData.invoiceDate ? new Date(initialData.invoiceDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
            setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
            setTemplateId(initialData.templateId?.id || initialData.templateId || '');
            setDiscountPercent(initialData.discountPercent?.toString() || '');
            setNotes(initialData.notes || '');

            if (String(initialData.status).toLowerCase().includes('partially paid')) {
                setPreviousDue(0);
            } else {
                setPreviousDue(initialData.previousRemaining || 0);
            }

            const customerId = initialData.customerId?.id || initialData.customerId;
            const foundCustomer = customers.find((c: any) => c.id === customerId);
            if (foundCustomer) {
                setCustomer(foundCustomer);
            }

            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items.map((item: any, index: number) => ({
                    id: index + 1,
                    itemId: item.itemId?.id || item.itemId || '',
                    title: item.title || '',
                    description: item.description || '',
                    quantity: item.quantity || 1,
                    rate: item.rate || 0,
                    amount: item.amount || 0,
                    unit: item.unit || ''
                })));
            }
        }
    }, [initialData, customers]);

    // Handle Customer Change (Create Mode)
    useEffect(() => {
        if (!isEditing) {
            if (customer) {
                const fetchCustomerData = async () => {
                    try {
                        const response = await axios.get(`/api/invoices?customerId=${customer.id}`);
                        const allInvoices = Array.isArray(response.data) ? response.data : response.data.invoices || [];

                        const payableInvoices = allInvoices.filter((inv: any) => {
                            const status = (inv.status || '').toLowerCase();
                            return ['sent', 'partially paid', 'overdue'].includes(status);
                        });

                        const totalDue = payableInvoices.reduce((sum: number, inv: any) => sum + (inv.remaining || 0), 0);
                        setPreviousDue(totalDue);

                        if (allInvoices.length > 0) {
                            allInvoices.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                            const lastInvoice = allInvoices[0];
                            if (lastInvoice.templateId) {
                                setTemplateId(lastInvoice.templateId.id || lastInvoice.templateId);
                            } else {
                                setTemplateId('');
                            }
                        } else {
                            setTemplateId('');
                        }
                    } catch (error) {
                        // ignored
                    }
                };
                fetchCustomerData();
            } else {
                setPreviousDue(0);
            }
        }
    }, [customer, isEditing]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || new Date();
        if (showInvoiceDatePicker) {
            setInvoiceDate(currentDate.toISOString().slice(0, 10));
            setShowInvoiceDatePicker(false);
        } else if (showDueDatePicker) {
            setDueDate(currentDate.toISOString().slice(0, 10));
            setShowDueDatePicker(false);
        }
    };

    const handleCustomerSelect = (opt: any) => {
        if (!opt) {
            setCustomer(null);
            return;
        }
        const c = customers.find(cus => String(cus.id) === String(opt.value));
        setCustomer(c || null);
    };

    const handleClearCustomer = () => {
        setCustomer(null);
    };

    const handleTemplateSelect = (opt: any) => {
        setTemplateId(opt ? String(opt.value) : '');
    };

    const calculateSubTotal = useCallback(() => {
        return items.reduce((acc, item) => acc + (item.amount || 0), 0);
    }, [items]);

    const calculateTotalAmount = useCallback(() => {
        const subtotal = calculateSubTotal();
        const discount = parseFloat(discountPercent) || 0;
        const discountAmount = (subtotal * discount) / 100;
        return Math.max(0, subtotal - discountAmount);
    }, [calculateSubTotal, discountPercent]);

    const preparePayload = () => {
        if (!customer) {
            Alert.alert('Error', 'Please select a customer.');
            return null;
        }

        const validItems = items.filter(item => item.title && item.quantity > 0);
        if (validItems.length === 0) {
            Alert.alert('Error', 'Please add at least one item.');
            return null;
        }

        return {
            invoiceNumber,
            invoiceDate,
            dueDate,
            customerId: customer.id,
            templateId: templateId || undefined,
            discountPercent: parseFloat(discountPercent) || 0,
            notes,
            items: validItems.map(item => ({
                itemId: item.itemId || undefined,
                title: item.title,
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                unit: item.unit
            })),
            previousRemaining: previousDue,
            subTotal: calculateSubTotal(),
            total: calculateTotalAmount(),
            status: initialData?.status || 'Draft'
        };
    };

    const handleSubmit = async () => {
        const payload = preparePayload();
        if (!payload) return;

        setLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await axios.put(`/api/invoices/${initialData.id}`, payload);
                Alert.alert('Success', 'Invoice updated successfully');
            } else {
                response = await axios.post('/api/invoices', payload);
                Alert.alert('Success', 'Invoice created successfully');
            }

            if (onSaveSuccess && response.data) {
                onSaveSuccess(response.data);
            }
        } catch (error: any) {
            console.error('Invoice save failed:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        if (!customer) {
            Alert.alert("Validation Error", "Please select a customer before previewing the invoice.");
            return;
        }

        const payload = preparePayload();
        if (!payload) return;

        const previewInvoiceData = {
            ...payload,
            id: initialData?.id || "preview-temp-id",
            invoiceNumber: invoiceNumber,
            invoiceDate: invoiceDate,
            dueDate: dueDate,
            customer: customer,
            templateId: templateId || undefined,
        };

        router.push({
            pathname: "/screens/Invoice/preview",
            params: {
                invoiceData: JSON.stringify(previewInvoiceData),
                template: templateId || undefined,
            },
        });
    };

    const handleItemSelect = (rowId: number, selectedItemId: string) => {
        const selected = itemOptions.find(i => String(i.id) === String(selectedItemId));
        if (selected) {
            const updatedItems = items.map(row => {
                if (row.id === rowId) {
                    const rate = selected.sellingPrice || 0;
                    const quantity = row.quantity || 1;
                    return {
                        ...row,
                        itemId: selected.id,
                        title: selected.name,
                        description: selected.description || '',
                        rate,
                        amount: rate * quantity,
                        unit: selected.unit || ''
                    };
                }
                return row;
            });
            setItems(updatedItems);
        }
    };

    const handleItemChange = (rowId: number, field: string, value: any) => {
        const updatedItems = items.map(row => {
            if (row.id === rowId) {
                const newRow = { ...row };
                if (field === 'quantity') {
                    newRow.quantity = parseFloat(value) || 0;
                    newRow.amount = newRow.rate * newRow.quantity;
                } else if (field === 'description') {
                    newRow.description = value;
                } else if (field === 'title') {
                    newRow.title = value;
                } else if (field === 'rate') {
                    newRow.rate = parseFloat(value) || 0;
                    newRow.amount = newRow.rate * newRow.quantity;
                } else if (field === 'unit') {
                    newRow.unit = value;
                }
                return newRow;
            }
            return row;
        });
        setItems(updatedItems);
    };

    const addItemRow = () => {
        setItems([...items, {
            id: items.length + 1,
            itemId: '',
            title: '',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            unit: '',
        }]);
    };

    const subTotalFormatted = Number(calculateSubTotal() || 0).toFixed(2);
    const grandTotalFormatted = (Number(previousDue || 0) + calculateTotalAmount()).toFixed(2);

    return {
        isEditing,
        invoiceNumber,
        setInvoiceNumber,
        invoiceDate,
        setInvoiceDate,
        dueDate,
        setDueDate,
        customer,
        setCustomer,
        templateId,
        setTemplateId,
        discountPercent,
        setDiscountPercent,
        notes,
        setNotes,
        items,
        setItems,
        previousDue,
        loading,

        // Options
        customerOptions,
        itemDropdownOptions,
        templateOptions,

        // Date Picker
        showInvoiceDatePicker,
        setShowInvoiceDatePicker,
        showDueDatePicker,
        setShowDueDatePicker,
        handleDateChange,
        // Selection actions
        handleCustomerSelect,
        handleClearCustomer,
        handleTemplateSelect,
        handleItemSelect,
        handleItemChange,
        addItemRow,

        // Form actions
        handleSubmit,
        handlePreview,
        subTotalFormatted,
        grandTotalFormatted,
        previousDueFormatted: Number(previousDue || 0).toFixed(2),
    };
};
