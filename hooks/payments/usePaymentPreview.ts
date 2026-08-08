import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import { Alert } from 'react-native';
import { savePDFToDevice } from '@/utils/fileSystem';
import { generatePaymentHTML } from '@/utils/generatePaymentHTML';
import axios from '@/services/api';

export const usePaymentPreview = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { paymentData, id } = params;

    const [payment, setPayment] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (paymentData) {
            try {
                const parsed = typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;
                setPayment(parsed);

                // Extract template from payment data if available
                if (parsed.templateId && typeof parsed.templateId === 'object') {
                    const templateObj = parsed.templateId;
                    // Handle nested styling configuration if present (common in such apps)
                    // If the template object has a 'design' or 'config' property, use that as the style source
                    // otherwise assume the object itself contains the styles.
                    const templateConfig = templateObj.design || templateObj.config || templateObj;
                    setTemplate(templateConfig);
                }
            } catch (e) {
                console.error("Failed to parse paymentData", e);
                Alert.alert("Error", "Failed to load payment data");
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [paymentData]);

    const handleGeneratePDF = async () => {
        if (!payment) return;
        try {
            const html = generatePaymentHTML(payment, template);
            const { uri } = await Print.printToFileAsync({ html });
            const fileName = `Receipt-${payment.paymentNumber || 'preview'}.pdf`;
            await savePDFToDevice(uri, fileName);
        } catch (e) {
            console.error("PDF generation error", e);
            Alert.alert("Error", "Failed to generate PDF");
        }
    };

    const handleEdit = () => {
        if (!payment?.id || payment.id === 'preview') return;
        router.push({
            pathname: "/screens/payments/edit",
            params: { paymentData: JSON.stringify(payment) }
        });
    };

    const handleSave = async (onSuccess?: () => void) => {
        if (!payment) return;
        setLoading(true);
        try {
            // Prepare payload
            const payload = { ...payment };
            if (payload.templateId && typeof payload.templateId === 'object') {
                payload.templateId = payload.templateId.id || payload.templateId.id;
            }
            // Ensure customerId is present
            if (!payload.customerId && payload.customer) {
                payload.customerId = payload.customer.id || payload.customer.id;
            }

            const response = await axios.post(`/api/payments`, payload);
            const savedPayment = response.data.payment || response.data;
            setPayment(savedPayment);
            Alert.alert("Success", "Payment saved successfully", [
                { text: "OK", onPress: () => router.replace("/screens/payments") }
            ]);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error saving payment:', error);
            const msg = error.response?.data?.message || "Failed to save payment";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailContext = () => {
        if (!payment) return;

        // Always pass complete payment data to avoid fetching by ID
        router.push({
            pathname: "/screens/payments/email",
            params: {
                paymentId: payment.id || 'preview',
                paymentData: JSON.stringify(payment)
            }
        });
    };

    const goBack = () => router.back();

    const isDraft = !payment?.id || payment.id === 'preview';

    return {
        payment,
        template,
        loading,
        isDraft,
        generateHTML: () => generatePaymentHTML(payment, template),
        handleGeneratePDF,
        handleEdit,
        handleSave,
        handleSendEmailContext,
        goBack
    };
};

export default usePaymentPreview;
