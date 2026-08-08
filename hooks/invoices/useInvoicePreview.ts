
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Print from "expo-print";
import { savePDFToDevice } from "@/utils/fileSystem";
import axios from "@/services/api";
import { generateInvoiceHTML } from "@/utils/generateInvoiceHTML";

export const useInvoicePreview = () => {
    const { id, invoiceData, template: templateParam } = useLocalSearchParams();
    const router = useRouter();

    const [displayInvoice, setDisplayInvoice] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [downloadFileName, setDownloadFileName] = useState('');

    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            setFetching(true);
            try {
                // 1. Check for local data passed via params (Preview Mode)
                if (invoiceData) {
                    try {
                        const parsedInvoice = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
                        if (isMounted) setDisplayInvoice(parsedInvoice);

                        if (templateParam) {
                            const parsedTemplate = typeof templateParam === 'string' ? JSON.parse(templateParam) : templateParam;
                            if (isMounted) setTemplate(parsedTemplate);
                        } else if (parsedInvoice.templateId) {
                            // Fallback logic if needed, but usually preview passes both
                        }
                    } catch (e) {
                        console.error("Error parsing preview data:", e);
                        if (isMounted) Alert.alert("Error", "Failed to parse preview data.");
                    } finally {
                        if (isMounted) setFetching(false);
                        return;
                    }
                }

                // 2. Fallback: Fetch by ID if no local data
                if (!id) {
                    if (isMounted) setFetching(false);
                    return;
                }

                const response = await axios.get(`/api/invoices/${id}`);

                if (isMounted) {
                    const fetchedInvoice = response.data.invoice || response.data;
                    setDisplayInvoice(fetchedInvoice);

                    if (fetchedInvoice.templateId) {
                        if (typeof fetchedInvoice.templateId === 'object') {
                            setTemplate(fetchedInvoice.templateId);
                        } else {
                            try {
                                const tempRes = await axios.get(`/api/templates/${fetchedInvoice.templateId}`);
                                if (isMounted) {
                                    setTemplate(tempRes.data.template || tempRes.data);
                                }
                            } catch (e) {
                                console.error("Error fetching template", e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching invoice:", error);
                if (isMounted) {
                    Alert.alert("Error", "Failed to load invoice details.");
                }
            } finally {
                if (isMounted) setFetching(false);
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, [id, invoiceData, templateParam]);

    const handleGeneratePDF = async () => {
        if (!displayInvoice) return;
        try {
            const html = generateInvoiceHTML(displayInvoice, template);
            const { uri } = await Print.printToFileAsync({ html });
            const fileName = `Invoice-${displayInvoice.invoiceNumber || 'preview'}.pdf`;
            const result = await savePDFToDevice(uri, fileName);
            if (result) {
                setDownloadFileName(fileName);
                setDownloadSuccess(true);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            Alert.alert("Error", "Failed to generate PDF.");
        }
    };

    const handleSaveDraft = async () => {
        if (!displayInvoice) return;
        setIsSaving(true);
        try {
            // Determine status to save
            let statusToSave = 'Draft';
            if (displayInvoice.status) {
                const currentStatus = String(displayInvoice.status).toLowerCase();
                const protectedStates = ['sent', 'partially paid', 'paid', 'overdue', 'cancelled'];
                if (protectedStates.includes(currentStatus)) {
                    statusToSave = displayInvoice.status;
                }
            }

            const payload = {
                ...displayInvoice,
                status: statusToSave,
                customerId: displayInvoice.customerId?.id || displayInvoice.customerId,
                items: displayInvoice.items.map((item: any) => ({
                    itemId: item.itemId?.id || item.itemId || (item.id && typeof item.id === 'string' && item.id.length > 10 ? item.id : undefined),
                    title: item.title,
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                    unit: item.unit
                })).filter((i: any) => i.itemId)
            };

            delete payload.id;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.__v;
            delete payload.customerName;
            delete payload.customerEmail;
            delete payload.customerPhone;
            delete payload.customerAddress;
            delete payload.customerCurrency;

            if (displayInvoice.id && displayInvoice.id !== 'preview') {
                await axios.put(`/api/invoices/${displayInvoice.id}`, { ...payload, status: statusToSave });
            } else {
                await axios.post('/api/invoices', payload);
            }

            router.push('/screens/Invoice/invoices');

        } catch (error: any) {
            console.error("Error saving draft:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to save draft.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendEmail = () => {
        if (!displayInvoice) return;
        router.push({
            pathname: '/screens/Invoice/email',
            params: {
                invoiceId: displayInvoice.id || 'preview',
                invoiceData: JSON.stringify(displayInvoice)
            }
        });
    };

    return {
        displayInvoice,
        template,
        fetching,
        isSaving,
        handleGeneratePDF,
        handleSendEmail,
        handleSaveDraft,
        router,
        downloadSuccess,
        setDownloadSuccess,
        downloadFileName,
    };
};
