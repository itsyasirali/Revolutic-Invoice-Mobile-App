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
}

export const usePaymentEmail = (paymentId: string, paymentDataParam?: any) => {
    const router = useRouter();
    const { user } = useProfile();

    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [emailData, setEmailData] = useState<EmailData>({
        from: '',
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        message: ''
    });

    const [availableEmails, setAvailableEmails] = useState<string[]>([]);

    useEffect(() => {
        const fetchPayment = async () => {
            if (!paymentId && !paymentDataParam) return;

            try {
                let paymentData: any;

                if (paymentDataParam) {
                    paymentData = typeof paymentDataParam === 'string' ? JSON.parse(paymentDataParam as string) : paymentDataParam;
                }

                if (!paymentData) {
                    setLoading(false);
                    return;
                }

                setPayment(paymentData);

                const userEmail = user?.email || '';
                const companyName = user?.companyName || 'Revolutic';

                const customer = paymentData.customer || paymentData.customerId;
                const allCustomerEmails: string[] = [];
                if (paymentData.customerEmail) allCustomerEmails.push(paymentData.customerEmail);
                if (customer?.email && !allCustomerEmails.includes(customer.email)) allCustomerEmails.push(customer.email);
                if (customer?.contacts) {
                    customer.contacts.forEach((c: any) => {
                        if (c.email && !allCustomerEmails.includes(c.email)) allCustomerEmails.push(c.email);
                    });
                }

                setAvailableEmails(allCustomerEmails);
                const recipients = allCustomerEmails.length > 0 ? [allCustomerEmails[0]] : [];

                const customerName = customer?.displayName || paymentData.customerDisplayName || customer?.firstName || 'Customer';
                const defaultMessage = `Dear ${customerName},

Thank you for your payment. We have received ${paymentData.currency} ${Number(paymentData.amountReceived ?? paymentData.amount ?? 0).toFixed(2)}.

Please find attached the payment receipt for your records.

If you have any questions, please feel free to contact us.

Best regards,
${user?.name || 'Team'}
${companyName}`;

                setEmailData({
                    from: userEmail,
                    to: recipients,
                    cc: [userEmail],
                    bcc: [],
                    subject: `Payment Receipt ${paymentData.reference || paymentData.paymentNumber || ''}`,
                    message: defaultMessage
                });

            } catch (error) {
                console.error('Error fetching payment:', error);
                Alert.alert('Error', 'Failed to load payment data');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [paymentId, paymentDataParam, user]);

    const handleSend = async () => {
        if (emailData.to.length === 0) {
            Alert.alert('Error', 'Please add at least one recipient');
            return;
        }

        setSending(true);
        try {
            let idToUse = payment.id;

            // If draft, create payment first
            if (!idToUse || idToUse === 'preview') {
                const payload = { ...payment };
                if (payload.templateId && typeof payload.templateId === 'object') {
                    payload.templateId = payload.templateId.id || payload.templateId.id;
                }
                if (!payload.customerId && payload.customer) { // Ensure customerId
                    payload.customerId = payload.customer.id || payload.customer.id;
                }

                const createResponse = await axios.post(`/api/payments`, payload);
                idToUse = createResponse.data.payment?.id || createResponse.data?.id;
            }

            if (!idToUse) throw new Error("Failed to create payment ID");

            await axios.post(`/api/payments/${idToUse}/send`, {
                to: emailData.to,
                cc: emailData.cc,
                bcc: emailData.bcc,
                subject: emailData.subject,
                message: emailData.message
            });

            Alert.alert('Success', 'Payment receipt sent successfully', [
                { text: 'OK', onPress: () => router.replace("/screens/payments") }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const addEmail = (type: 'to' | 'cc' | 'bcc', email: string) => {
        if (type === 'to' && !emailData.to.includes(email)) {
            setEmailData(prev => ({ ...prev, to: [...prev.to, email] }));
        } else if (type === 'cc' && !emailData.cc.includes(email)) {
            setEmailData(prev => ({ ...prev, cc: [...prev.cc, email] }));
        } else if (type === 'bcc' && !emailData.bcc.includes(email)) {
            setEmailData(prev => ({ ...prev, bcc: [...prev.bcc, email] }));
        }
    };

    const removeEmail = (type: 'to' | 'cc' | 'bcc', index: number) => {
        if (type === 'to') setEmailData(prev => ({ ...prev, to: prev.to.filter((_, i) => i !== index) }));
        else if (type === 'cc') setEmailData(prev => ({ ...prev, cc: prev.cc.filter((_, i) => i !== index) }));
        else setEmailData(prev => ({ ...prev, bcc: prev.bcc.filter((_, i) => i !== index) }));
    };

    const updateSubject = (text: string) => {
        setEmailData(prev => ({ ...prev, subject: text }));
    };

    const updateMessage = (text: string) => {
        setEmailData(prev => ({ ...prev, message: text }));
    };

    return {
        payment,
        loading,
        sending,
        emailData,
        availableEmails,
        handleSend,
        addEmail,
        removeEmail,
        updateSubject,
        updateMessage,
        router
    };
};
