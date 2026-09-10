import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, Keyboard } from 'react-native';
import axios from '@/services/api';
import { useProfile } from '@/hooks/auth/useProfile';

export interface EmailData {
    from: string;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    message: string;
    attachPDF: boolean;
}

export const useInvoiceEmail = (passedInvoiceId?: string, passedInitialData?: any) => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const invoiceId = passedInvoiceId || (Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId);
    const initialData = passedInitialData !== undefined ? passedInitialData : params.invoiceData;
    const { user } = useProfile();

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [emailData, setEmailData] = useState<EmailData>({
        from: '',
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        message: '',
        attachPDF: true
    });

    const [availableEmails, setAvailableEmails] = useState<string[]>([]);

    // Recipient Modal State
    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [newEmailInput, setNewEmailInput] = useState('');
    const [addingTo, setAddingTo] = useState<'to' | 'cc' | 'bcc'>('to');

    // Initialize data
    useEffect(() => {
        const initialize = async () => {
            let data = initialData;

            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error("Failed to parse initial invoice data", e);
                }
            }

            if (data) {
                setInvoice(data);
                prepareEmailData(data);
                setLoading(false);
                return;
            }

            if (!invoiceId || invoiceId === 'preview') {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/invoices/${invoiceId}`);
                const inv = response.data?.invoice || response.data;
                setInvoice(inv);
                prepareEmailData(inv);
            } catch (error) {
                console.error("Failed to fetch invoice details for email", error);
                Alert.alert("Error", "Failed to load invoice details");
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [invoiceId, initialData, user]);

    const prepareEmailData = (invoiceData: any) => {
        const userEmail = user?.email || 'your-email@company.com';
        const companyName = user?.companyName || 'Personal';

        const allCustomerEmails: string[] = [];

        // 1. Check top-level email field
        if (invoiceData.customerEmail) {
            allCustomerEmails.push(invoiceData.customerEmail);
        }


        // 2. Check customer object email
        if (invoiceData.customerId?.email && !allCustomerEmails.includes(invoiceData.customerId.email)) {
            allCustomerEmails.push(invoiceData.customerId.email);
        }

        // 3. Check customer object contacts
        if (invoiceData.customerId?.contacts) {
            invoiceData.customerId.contacts.forEach((contact: any) => {
                if (contact.email && !allCustomerEmails.includes(contact.email)) {
                    allCustomerEmails.push(contact.email);
                }
            });
        }

        // 4. Fallback if just an ID or no deep structure
        if (allCustomerEmails.length === 0 && invoiceData.customer?.email) {
            allCustomerEmails.push(invoiceData.customer.email);
        }

        setAvailableEmails(allCustomerEmails);

        const recipients = allCustomerEmails.length > 0 ? [allCustomerEmails[0]] : [];
        const currentInvoiceAmount = invoiceData.remaining !== undefined ? Number(invoiceData.remaining) : (Number(invoiceData.total) || 0);
        const previousRemaining = Number(invoiceData.previousRemaining) || 0;
        const totalBalanceDue = currentInvoiceAmount + previousRemaining;

        const customerName = invoiceData.customer?.displayName || invoiceData.customerDisplayName || invoiceData.customerName || invoiceData.customerId?.displayName || 'Customer';

        let formattedDate = 'N/A';
        try {
            formattedDate = invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString() : 'N/A';
        } catch (e) { }

        let formattedDueDate = 'N/A';
        try {
            formattedDueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A';
        } catch (e) { }

        const defaultMessage = `Dear ${customerName},

Thank you for choosing to work with us! We truly appreciate your trust and continued partnership.

Please find attached your invoice for the services/products provided. You can view, download, and print the invoice PDF from the attachment below.

INVOICE DETAILS:
Invoice Number: ${invoiceData.invoiceNumber}
Invoice Date: ${formattedDate}
Due Date: ${formattedDueDate}
Amount Due: ${invoiceData.currency || 'PKR'} ${totalBalanceDue.toFixed(2)}

If you have any questions or concerns regarding this invoice, please don't hesitate to reach out. We're here to help!

Thank you once again for your business. We look forward to serving you in the future.

Best regards,
${user?.name || user?.firstName || 'Team'}
${companyName}`;

        setEmailData({
            from: userEmail,
            to: recipients,
            cc: [userEmail],
            bcc: [],
            subject: `Invoice - ${invoiceData.invoiceNumber} from ${companyName}`,
            message: defaultMessage,
            attachPDF: true
        });
    };

    const handleSend = async () => {
        if (emailData.to.length === 0) {
            Alert.alert('Error', 'Please add at least one recipient');
            return;
        }

        setSending(true);
        try {
            let targetId = invoiceId;

            // If it's a new/draft invoice not yet saved (passed from preview)
            if (!targetId || targetId === 'preview') {
                // Create invoice first
                if (!invoice) throw new Error("No invoice data to save");

                const extractedCustomerId = typeof invoice.customerId === 'object' ? invoice.customerId?.id : invoice.customerId;
                const payload = {
                    invoiceNumber: invoice.invoiceNumber,
                    invoiceDate: invoice.invoiceDate,
                    dueDate: invoice.dueDate,
                    subTotal: invoice.subTotal,
                    total: invoice.total,
                    currency: invoice.currency,
                    notes: invoice.notes,
                    discountPercent: invoice.discountPercent,
                    templateId: typeof invoice.templateId === 'object' ? invoice.templateId?.id : invoice.templateId,
                    status: (invoice.status === 'Paid' || invoice.status === 'Partially Paid') ? invoice.status : 'Sent',
                    customerId: Number(extractedCustomerId),
                    items: invoice.items?.map((item: any) => ({
                        itemId: typeof item.itemId === 'object' ? item.itemId?.id : item.itemId,
                        title: item.title,
                        description: item.description,
                        quantity: Number(item.quantity || 1),
                        rate: Number(item.rate || 0),
                        amount: Number(item.amount || 0),
                        unit: item.unit
                    })).filter((i: any) => i.itemId)
                };

                // If item logic is complex, might be better to just pass what we have if the backend handles it, 
                // but typically backend needs itemId. If items are plain objects from form:
                if (invoice.items && invoice.items[0]) {
                    // Check if items need formatting
                }

                // Clean payload
                delete (payload as any).id;
                delete (payload as any).createdAt;
                delete (payload as any).updatedAt;
                delete (payload as any).__v;

                const createRes = await axios.post('/api/invoices', payload);
                targetId = createRes.data.invoice?.id || createRes.data.id;
            }

            if (!targetId) throw new Error("Failed to process invoice ID");

            await axios.post(`/api/invoices/${targetId}/send`, {
                to: emailData.to,
                cc: emailData.cc,
                bcc: emailData.bcc,
                message: emailData.message,
                attachPDF: emailData.attachPDF
            });

            Alert.alert('Success', 'Invoice saved and email sent successfully', [
                { text: 'OK', onPress: () => router.push('/screens/Invoice/invoices') } // Go to list or detail
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const addEmail = (type: 'to' | 'cc' | 'bcc', email: string) => {
        const targetList = emailData[type];
        if (!targetList.includes(email)) {
            setEmailData(prev => ({ ...prev, [type]: [...prev[type], email] }));
        }
    };

    const removeEmail = (type: 'to' | 'cc' | 'bcc', index: number) => {
        setEmailData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    const updateMessage = (text: string) => {
        setEmailData(prev => ({ ...prev, message: text }));
    };

    const toggleAttachPDF = () => {
        setEmailData(prev => ({ ...prev, attachPDF: !prev.attachPDF }));
    };

    const openEmailSelector = (type: 'to' | 'cc' | 'bcc') => {
        setAddingTo(type);
        setShowRecipientModal(true);
    };

    const closeRecipientModal = () => {
        setShowRecipientModal(false);
    };

    const handleAddCustomEmail = () => {
        if (newEmailInput.trim() && newEmailInput.includes('@')) {
            addEmail(addingTo, newEmailInput.trim());
            setNewEmailInput('');
            setShowRecipientModal(false);
        }
    };

    const handleAddEmailFromList = (email: string) => {
        addEmail(addingTo, email);
    };

    const handleGoBack = () => {
        router.back();
    };

    return {
        invoice,
        loading,
        sending,
        emailData,
        availableEmails,
        showRecipientModal,
        setShowRecipientModal,
        newEmailInput,
        setNewEmailInput,
        addingTo,
        setAddingTo,
        openEmailSelector,
        closeRecipientModal,
        handleAddCustomEmail,
        handleAddEmailFromList,
        handleSend,
        addEmail,
        removeEmail,
        updateMessage,
        toggleAttachPDF,
        handleGoBack,
        router
    };
};

