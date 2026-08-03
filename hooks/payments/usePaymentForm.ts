import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from '@/services/api'; // Use configured axios instance
import { useCustomerList } from '../customers/useCustomerList';
import { PaymentFormData } from '@/types/Payment'; // Ensure this type exists or use any for now if broken
import useTemplatesList from '../templates/useTemplatesList';

export const usePaymentForm = (initialPayment?: any) => {
    const params = useLocalSearchParams();
    const id = params.id as string || initialPayment?.id;
    const isEditMode = Boolean(id);

    const { customers, loading: customersLoading } = useCustomerList();
    const { templates, loading: templatesLoading } = useTemplatesList();

    const [paymentData, setPaymentData] = useState<PaymentFormData>(() => {
        if (initialPayment) {
            return {
                customerId: initialPayment.customer?.id || initialPayment.customerId?.id || initialPayment.customerId || '',
                customerName: initialPayment.customer?.displayName || initialPayment.customerId?.displayName || initialPayment.customerDisplayName || '',
                customerEmail: initialPayment.customer?.email || initialPayment.customerId?.email || initialPayment.customerEmail || '',
                paymentDate: initialPayment.paymentDate ? new Date(initialPayment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                paymentMethod: initialPayment.paymentMode || initialPayment.paymentMethod || 'Cash',
                reference: initialPayment.reference || initialPayment.referenceNo || '',
                amount: (initialPayment.amountReceived ?? initialPayment.amount ?? '').toString(),
                bankCharges: (initialPayment.bankCharges ?? '').toString(),
                currency: initialPayment.currency || 'USD',
                description: initialPayment.description || '',
                status: initialPayment.status || 'Pending',
                notes: initialPayment.notes || '',
                templateId: initialPayment.templateId?.id || initialPayment.templateId || '',
            };
        }
        return {
            customerId: '',
            customerName: '',
            customerEmail: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            reference: '',
            amount: '',
            bankCharges: '',
            currency: 'USD',
            description: '',
            status: 'Pending',
            notes: '',
            templateId: '',
        };
    });

    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
    const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
    const [appliedAmounts, setAppliedAmounts] = useState<Record<string, number>>({});
    const [payAllRemaining, setPayAllRemaining] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Set default template
    useEffect(() => {
        if (!paymentData.templateId && templates.length > 0 && !isEditMode) {
            const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
            if (defaultTemplate) {
                setPaymentData(prev => ({ ...prev, templateId: defaultTemplate.id }));
            }
        }
    }, [templates, isEditMode]);

    // Fetch unpaid invoices when customer selected
    useEffect(() => {
        if (!paymentData.customerId) {
            setUnpaidInvoices([]);
            return;
        }

        const fetchUnpaidInvoices = async () => {
            try {
                // Use relative path with configured axios
                const response = await axios.get(`/api/invoices?customerId=${paymentData.customerId}`);
                const invoices = response.data.invoices || response.data || [];
                const eligible = invoices.filter((inv: any) => {
                    const status = inv.status?.toLowerCase() || '';
                    return (status === 'sent' || status === 'partially paid' || status === 'overdue') && (inv.remaining || 0) > 0;
                });
                setUnpaidInvoices(eligible);
            } catch (error) {
                console.error('Error fetching unpaid invoices:', error);
                setUnpaidInvoices([]);
            }
        };

        fetchUnpaidInvoices();
    }, [paymentData.customerId]);

    const selectCustomer = (customer: any) => {
        setPaymentData((prev) => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.displayName || customer.companyName || '',
            customerEmail: customer.contacts?.[0]?.email || customer.email || '',
            currency: customer.currency || prev.currency || 'USD',
        }));
        setSelectedCustomerData(customer);
        setCustomerSearchTerm(customer.displayName || customer.companyName || '');
        setCustomerDropdownOpen(false);
        setAppliedAmounts({});
        setPayAllRemaining(false);
    };

    const clearCustomer = () => {
        setPaymentData((prev) => ({
            ...prev,
            customerId: '',
            customerName: '',
            customerEmail: '',
            amount: '',
        }));
        setSelectedCustomerData(null);
        setCustomerSearchTerm('');
        setUnpaidInvoices([]);
        setAppliedAmounts({});
        setPayAllRemaining(false);
    };

    const handlePayAllRemainingToggle = () => {
        setPayAllRemaining((prev) => {
            const newValue = !prev;
            if (newValue) {
                const totalRemaining = unpaidInvoices.reduce((sum, inv) => sum + (inv.remaining || 0), 0);
                setPaymentData((prev) => ({ ...prev, amount: totalRemaining.toString() }));

                const newAppliedAmounts: Record<string, number> = {};
                unpaidInvoices.forEach((inv) => {
                    newAppliedAmounts[inv.id] = inv.remaining || 0;
                });
                setAppliedAmounts(newAppliedAmounts);
            } else {
                setPaymentData((prev) => ({ ...prev, amount: '' }));
                setAppliedAmounts({});
            }
            return newValue;
        });
    };

    const handleAppliedAmountChange = (invoiceId: string, value: string) => {
        const numValue = value === '' ? 0 : Number(value);
        setAppliedAmounts((prev) => {
            const newApplied = { ...prev, [invoiceId]: numValue };
            const total = Object.values(newApplied).reduce((sum, val) => sum + (val || 0), 0);
            setPaymentData(d => ({ ...d, amount: total.toString() }));
            return newApplied;
        });
    };

    const handlePayInFull = (invoiceId: string, remaining: number) => {
        setAppliedAmounts((prev) => {
            const newApplied = { ...prev, [invoiceId]: remaining };
            const total = Object.values(newApplied).reduce((sum, val) => sum + (val || 0), 0);
            setPaymentData(d => ({ ...d, amount: total.toString() }));
            return newApplied;
        });
    };

    const totalApplied = Object.values(appliedAmounts).reduce((sum, amount) => sum + amount, 0);
    const amountVal = Number(paymentData.amount || 0);
    const amountInExcess = Math.max(amountVal - totalApplied, 0);

    const filteredCustomers = customers.filter((customer) => {
        const searchLower = customerSearchTerm.toLowerCase();
        const displayName = (customer.displayName || customer.companyName || '').toLowerCase();
        const email = (customer.contacts?.[0]?.email || '').toLowerCase();
        const companyName = (customer.companyName || '').toLowerCase();
        return displayName.includes(searchLower) || email.includes(searchLower) || companyName.includes(searchLower);
    });

    const handleSave = async (isDraft: boolean = false) => {
        if (isSaving || isSubmitting) return;

        isDraft ? setIsSaving(true) : setIsSubmitting(true);
        try {
            const appliedInvoicesPayload = Object.entries(appliedAmounts)
                .filter(([, amount]) => amount > 0)
                .map(([invoiceId, amount]) => {
                    const invoice = unpaidInvoices.find(inv => inv.id === Number(invoiceId));
                    return {
                        invoiceId: Number(invoiceId),
                        amount: Number(amount),
                        invoiceNumber: invoice?.invoiceNumber,
                        invoiceAmount: invoice?.total,
                    }
                });

            const payload = {
                paymentDate: paymentData.paymentDate,
                reference: paymentData.reference || undefined,
                customerId: paymentData.customerId,
                customerDisplayName: paymentData.customerName,
                customerEmail: paymentData.customerEmail,
                paymentMode: paymentData.paymentMethod,
                amountReceived: Number(paymentData.amount || 0),
                bankCharges: Number(paymentData.bankCharges || 0),
                currency: paymentData.currency,
                status: isDraft ? 'Pending' : 'Completed',
                notes: paymentData.notes,
                description: paymentData.description,
                templateId: paymentData.templateId,
                appliedInvoices: appliedInvoicesPayload.length > 0 ? appliedInvoicesPayload : undefined,
            };

            let response;
            if (isEditMode && id) {
                response = await axios.put(`/api/payments/${id}`, payload);
            } else {
                response = await axios.post(`/api/payments`, payload);
            }

            return { success: true, payment: response.data.payment || response.data };

        } catch (error: any) {
            console.error('Error saving payment:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save payment';
            return { success: false, error: errorMessage };
        } finally {
            isDraft ? setIsSaving(false) : setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
        setPaymentData((prev: any) => ({ ...prev, [field]: value }));

        if (field === 'amount') {
            const totalAmount = Number(value) || 0;
            let remainingToAllocate = totalAmount;
            const newApplied: Record<string, number> = {};

            unpaidInvoices.forEach(inv => {
                if (remainingToAllocate > 0) {
                    const allocatable = Math.min(remainingToAllocate, inv.remaining);
                    newApplied[inv.id] = allocatable;
                    remainingToAllocate -= allocatable;
                } else {
                    newApplied[inv.id] = 0;
                }
            });
            setAppliedAmounts(newApplied);
        }
    };

    const validatePayment = () => {
        if (!paymentData.customerId) {
            Alert.alert('Error', 'Please select a customer.');
            return false;
        }
        if (!paymentData.amount || Number(paymentData.amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return false;
        }
        return true;
    };

    const submitPayment = async (onSave?: (data: any) => Promise<any>, onCancel?: () => void) => {
        if (!validatePayment()) return;

        const result = await handleSave(false);
        if (result?.success) {
            if (onSave) {
                await onSave(result.payment);
            }
            if (onCancel) {
                onCancel();
            }
        } else if (result?.error) {
            Alert.alert('Error', result.error);
        }
    };

    const previewPayment = async (onSave?: (data: any) => Promise<any>, onCancel?: () => void) => {
        if (!validatePayment()) return;

        // Construct payload locally without saving
        const appliedInvoicesPayload = Object.entries(appliedAmounts)
            .filter(([, amount]) => amount > 0)
            .map(([invoiceId, amount]) => {
                const invoice = unpaidInvoices.find(inv => inv.id === Number(invoiceId));
                return {
                    invoiceId: Number(invoiceId),
                    amount: Number(amount),
                    invoiceNumber: invoice?.invoiceNumber,
                    invoiceAmount: invoice?.total,
                }
            });

        const selectedTemplate = templates.find((t: any) => t.id === paymentData.templateId || t.id === paymentData.templateId);

        const previewData = {
            paymentDate: paymentData.paymentDate,
            reference: paymentData.reference,
            customerId: paymentData.customerId,
            customerDisplayName: paymentData.customerName,
            customerEmail: paymentData.customerEmail,
            paymentMode: paymentData.paymentMethod,
            amountReceived: Number(paymentData.amount || 0),
            bankCharges: Number(paymentData.bankCharges || 0),
            currency: paymentData.currency,
            status: 'Pending', // Default for preview
            notes: paymentData.notes,
            description: paymentData.description,
            templateId: selectedTemplate?.raw || selectedTemplate || paymentData.templateId, // Pass full raw object
            appliedInvoices: appliedInvoicesPayload,
            // Pass customer object for context if needed
            customer: selectedCustomerData || {
                id: paymentData.customerId,
                displayName: paymentData.customerName,
                email: paymentData.customerEmail
            },
            amount: Number(paymentData.amount || 0), // Ensure amount is present for consistency
        };

        // Navigate to preview
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { router } = require('expo-router');
        router.push({
            pathname: "/screens/payments/preview",
            params: { paymentData: JSON.stringify(previewData) }
        });
    };

    return {
        isEditMode,
        paymentData,
        setPaymentData,
        customerSearchTerm,
        setCustomerSearchTerm,
        customerDropdownOpen,
        setCustomerDropdownOpen,
        selectedCustomerData,
        setSelectedCustomerData,
        unpaidInvoices,
        setUnpaidInvoices,
        appliedAmounts,
        setAppliedAmounts,
        payAllRemaining,
        setPayAllRemaining,
        isSubmitting,
        isSaving,
        filteredCustomers,
        totalApplied,
        amountInExcess,
        selectCustomer,
        clearCustomer,
        handlePayAllRemainingToggle,
        handleAppliedAmountChange,
        handlePayInFull,
        handleSave,
        handleInputChange,
        submitPayment,
        previewPayment,
        customersLoading,
        templates,
    };
};

export default usePaymentForm;
