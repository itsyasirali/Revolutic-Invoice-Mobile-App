import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
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

export const useInvoiceEmail = (invoiceId: string, initialData?: any) => {
    const router = useRouter();
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
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Keyboard listeners
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Initialize data
    useEffect(() => {
        const initialize = async () => {
            let data = initialData;

            // If initial data is string (from params), parse it
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error("Failed to parse initial invoice data", e);
                    // Don't set data to null yet, might still want to try fetch if ID exists
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
                data = response.data;
                setInvoice(data);
                prepareEmailData(data);
            } catch (error) {
                console.error('Error fetching invoice:', error);
                Alert.alert('Error', 'Failed to load invoice data');
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

        const customerName = invoiceData.customerDisplayName || invoiceData.customerName || invoiceData.customerId?.displayName || 'Customer';

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

                const payload = {
                    ...invoice,
                    status: (invoice.status === 'Paid' || invoice.status === 'Partially Paid') ? invoice.status : 'Sent', // Mark as sent unless already paid
                    customerId: invoice.customerId?.id || invoice.customerId, // Ensure ID format
                    items: invoice.items.map((item: any) => ({
                        itemId: item.itemId?.id || item.itemId || (item.id && typeof item.id === 'string' && item.id.length > 10 ? item.id : undefined), // Try to resolve item ID
                        title: item.title,
                        description: item.description,
                        quantity: item.quantity,
                        rate: item.rate,
                        amount: item.amount,
                        unit: item.unit
                    })).filter((i: any) => i.itemId) // Ensure we have valid items
                };

                // If item logic is complex, might be better to just pass what we have if the backend handles it, 
                // but typically backend needs itemId. If items are plain objects from form:
                if (invoice.items && invoice.items[0]) {
                    // Check if items need formatting
                }

                // Clean payload
                delete payload.id;
                delete payload.createdAt;
                delete payload.updatedAt;
                delete payload.__v;

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

    return {
        invoice,
        loading,
        sending,
        emailData,
        availableEmails,
        isKeyboardVisible,
        handleSend,
        addEmail,
        removeEmail,
        updateMessage,
        toggleAttachPDF,
        router
    };
};
