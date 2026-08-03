import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import axios from '@/services/api';
import { useCustomerList } from '@/hooks/customers/useCustomerList';

export const useInvoiceForm = (initialData: any, onSaveSuccess?: (invoice: any) => void) => {
    const { customers } = useCustomerList();

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

    const isEditing = !!initialData?.id;

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
                // Fetch Customer Invoices to calculate Previous Due and get Template
                const fetchCustomerData = async () => {
                    try {
                        const response = await axios.get(`/api/invoices?customerId=${customer.id}`);
                        const allInvoices = Array.isArray(response.data) ? response.data : response.data.invoices || [];

                        // Calculate Previous Due (excluding Drafts and Cancelled)
                        const payableInvoices = allInvoices.filter((inv: any) => {
                            const status = (inv.status || '').toLowerCase();
                            return ['sent', 'partially paid', 'overdue'].includes(status);
                        });

                        const totalDue = payableInvoices.reduce((sum: number, inv: any) => sum + (inv.remaining || 0), 0);
                        setPreviousDue(totalDue);

                        // Get Template from last invoice
                        if (allInvoices.length > 0) {
                            // Sort by date (newest first)
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
                        // console.error("Failed to fetch customer data:", error);
                    }
                };
                fetchCustomerData();
            } else {
                setPreviousDue(0);
                setTemplateId('');
            }
        }
    }, [customer, isEditing]);

    // Helpers
    const calculateSubTotal = () => items.reduce((total, item) => total + item.amount, 0);
    const calculateTotalAmount = () => {
        const subTotal = calculateSubTotal();
        const discount = (Number(discountPercent) || 0) / 100 * subTotal;
        return subTotal - discount;
    };

    const preparePayload = () => {
        return {
            invoiceNumber,
            invoiceDate,
            dueDate,
            customerId: customer?.id,
            templateId,
            notes,
            discountPercent: Number(discountPercent) || 0,
            currency: customer?.currency || 'PKR',
            items: items.map(item => ({
                itemId: item.itemId,
                title: item.title,
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                unit: item.unit,
            })),
            subTotal: calculateSubTotal(),
            total: calculateTotalAmount(),
            previousRemaining: previousDue,
        };
    };

    const handleSubmit = async (status: 'Draft' | 'Sent' = 'Draft') => {
        if (!customer) {
            Alert.alert("Validation Error", "Please select a customer before saving the invoice.");
            return { success: false, error: "No customer selected" };
        }
        setLoading(true);
        try {
            // Determine effective status
            let effectiveStatus = status;
            if (status === 'Draft' && isEditing && initialData?.status) {
                // If saving as draft (default save) but invoice is already in a "final" state, preserve that state
                const currentStatus = String(initialData.status).toLowerCase();
                // Valid states to preserve
                const protectedStates = ['sent', 'partially paid', 'paid', 'overdue', 'cancelled'];
                if (protectedStates.includes(currentStatus)) {
                    effectiveStatus = initialData.status;
                }
            }

            const payload = { ...preparePayload(), status: effectiveStatus };
            let result;
            if (isEditing) {
                result = await axios.put(`/api/invoices/${initialData.id}`, payload);
            } else {
                result = await axios.post('/api/invoices', payload);
            }

            if (onSaveSuccess) onSaveSuccess(result.data.invoice || result.data);
            return { success: true, invoice: result.data };
        } catch (error: any) {
            // console.error('Save error:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const handleItemSelect = (rowId: number, itemId: string, itemOptions: any[]) => {
        const item = itemOptions.find(i => i.id === itemId);
        if (item) {
            const updatedItems = items.map(row => {
                if (row.id === rowId) {
                    return {
                        ...row,
                        itemId,
                        title: item.name,
                        description: item.description || '',
                        rate: item.sellingPrice || 0,
                        unit: item.unit || '',
                        amount: (item.sellingPrice || 0) * row.quantity
                    };
                }
                return row;
            });
            setItems(updatedItems);
        }
    };

    const handleItemChange = (rowId: number, field: string, value: string) => {
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

    return {
        invoiceNumber, setInvoiceNumber,
        invoiceDate, setInvoiceDate,
        dueDate, setDueDate,
        customer, setCustomer,
        templateId, setTemplateId,
        discountPercent, setDiscountPercent,
        notes, setNotes,
        items, setItems,
        previousDue, setPreviousDue,
        loading,
        handleSubmit,
        calculateSubTotal,
        calculateTotalAmount,
        preparePayload,
        // Item handlers
        handleItemSelect,
        handleItemChange,
        addItemRow
    };
};
