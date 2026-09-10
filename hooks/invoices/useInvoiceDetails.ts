import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '@/services/api';
import { Invoice } from '@/types/invoice';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, useWindowDimensions, Platform, PermissionsAndroid } from 'react-native';
import { savePDFToDevice } from "@/utils/fileSystem";
import { useInvoiceDelete } from './useInvoiceDelete';
import * as Print from "expo-print";
import { generateInvoiceHTML } from "@/utils/generateInvoiceHTML";

const useInvoiceDetails = () => {
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [downloadFileName, setDownloadFileName] = useState('');

    const { invoice, invoiceData: invoiceDataParam, id, invoiceId, template } = useLocalSearchParams();
    const router = useRouter();
    const { deleteInvoice } = useInvoiceDelete();

    const [invoiceData, setInvoiceData] = useState<any>(() => {
        const passedData = invoice || invoiceDataParam;
        if (passedData) {
            try {
                const raw = Array.isArray(passedData) ? passedData[0] : passedData;
                return JSON.parse(raw);
            } catch (err) {
                // console.warn("Failed to parse invoice param initially", err);
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [showEditForm, setShowEditForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [expandMoreInfo, setExpandMoreInfo] = useState(true);

    const targetId = id || invoiceId;

    useEffect(() => {
        const loadData = async () => {
            // Data already initialized from params, no need to parse again
            if (invoiceData) return;

            const passedData = invoice || invoiceDataParam;
            if (passedData) {
                try {
                    const raw = Array.isArray(passedData) ? passedData[0] : passedData;
                    const parsed = JSON.parse(raw);
                    setInvoiceData(parsed);
                    return;
                } catch (err) {
                    // console.warn("Failed to parse invoice param in effect", err);
                }
            }
        };
        loadData();
    }, [invoice, invoiceDataParam]);

    const handleSaveSuccess = (updatedInvoice: any) => {
        setInvoiceData((prev: any) => ({ ...prev, ...updatedInvoice }));
        setShowEditForm(false);
        Alert.alert("Success", "Invoice updated");
    };

    const handleDelete = async () => {
        if (!invoiceData) return;
        Alert.alert("Delete", "Are you sure you want to delete this invoice?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const result = await deleteInvoice(invoiceData.id);
                    if (result.success) router.back();
                    else Alert.alert("Error", result.error || "Delete failed");
                },
            },
        ]);
        setShowMenu(false);
    };

    const handleDownloadPDF = async () => {
        setShowMenu(false);
        if (!invoiceData) return;

        try {
            setLoading(true);
            // Alert.alert("Debug", "Starting PDF Generation..."); // Optional debug
            let templateData = null;

            if (template) {
                try {
                    templateData = typeof template === 'string' ? JSON.parse(template) : template;
                } catch (e) {
                    console.error("Error parsing template param:", e);
                }
            }

            if (!templateData && invoiceData.templateId) {
                if (typeof invoiceData.templateId === 'object') {
                    templateData = invoiceData.templateId;
                } else {
                    // It's an ID, fetch it
                    try {
                        const tempRes = await axios.get(`/api/templates/${invoiceData.templateId}`);
                        templateData = tempRes.data.template || tempRes.data;
                    } catch (e) {
                        console.error("Error fetching template in handleDownloadPDF:", e);
                    }
                }
            }

            // With the API call removed, strictly local usage implies we must have the object.

            const html = generateInvoiceHTML(invoiceData, templateData);
            const { uri } = await Print.printToFileAsync({ html });
            const fileName = `Invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`;
            const result = await savePDFToDevice(uri, fileName);
            if (result) {
                setDownloadFileName(fileName);
                setDownloadSuccess(true);
            }
        } catch (error) {
            console.error("Download PDF Error:", error);
            Alert.alert("Error", "Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = () => {
        setShowMenu(false);
        setShowEditForm(true);
    };

    const handleCloseEdit = () => {
        setShowEditForm(false);
    };

    const handleOpenMenu = () => {
        setShowMenu(true);
    };

    const handleCloseMenu = () => {
        setShowMenu(false);
    };

    const handleHideDownloadPopIn = () => {
        setDownloadSuccess(false);
    };

    const handleNavigateBack = () => {
        router.back();
    };

    const handleOpenEmail = () => {
        if (!invoiceData) return;
        setShowMenu(false);
        router.push({
            pathname: "/screens/Invoice/email",
            params: {
                invoiceId: invoiceData.id,
                invoiceData: JSON.stringify(invoiceData),
            },
        });
    };

    const handleOpenPreview = () => {
        if (!invoiceData) return;
        setShowMenu(false);
        const templateData =
            invoiceData.templateId && typeof invoiceData.templateId === "object"
                ? invoiceData.templateId
                : undefined;
        router.push({
            pathname: "/screens/Invoice/preview",
            params: {
                invoiceId: invoiceData.id,
                invoiceData: JSON.stringify(invoiceData),
                template: templateData ? JSON.stringify(templateData) : undefined,
            },
        });
    };

    const getStatusStyle = (status: string) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case "paid":
                return { bg: "bg-primary/10", text: "text-primary" };
            case "sent":
                return { bg: "bg-primary/10", text: "text-primary" };
            case "draft":
                return { bg: "bg-primary/10", text: "text-primary" };
            case "overdue":
                return { bg: "bg-red-100", text: "text-red-700" };
            case "cancelled":
                return { bg: "bg-red-100", text: "text-red-700" };
            default:
                return { bg: "bg-gray-100", text: "text-gray-700" };
        }
    };

    const statusStyle = invoiceData ? getStatusStyle(invoiceData.status) : { bg: "bg-gray-100", text: "text-gray-700" };

    const customerDisplayName = invoiceData ? (
        invoiceData.customer?.displayName ||
        invoiceData.customerDisplayName ||
        invoiceData.customerName ||
        (typeof invoiceData.customerId === "object" ? invoiceData.customerId?.displayName : "Unknown")
    ) : "";

    const customerInitial = customerDisplayName ? customerDisplayName.charAt(0).toUpperCase() : "C";

    const customerEmail = invoiceData ? (
        invoiceData.customer?.contacts?.[0]?.email ||
        invoiceData.customerEmail ||
        (typeof invoiceData.customerId === "object"
            ? invoiceData.customerId?.email || invoiceData.customerId?.contacts?.[0]?.email
            : "")
    ) : "";

    return {
        // State
        invoiceData,
        loading,
        error,
        showEditForm,
        showMenu,
        expandMoreInfo,

        // Status & Derived
        downloadSuccess,
        downloadFileName,
        statusStyle,
        customerDisplayName,
        customerInitial,
        customerEmail,

        // Setters
        setShowEditForm,
        setShowMenu,
        setExpandMoreInfo,
        setDownloadSuccess,

        // Actions
        handleSaveSuccess,
        handleDelete,
        handleDownloadPDF,
        onDownloadPress: handleDownloadPDF,
        handleOpenEdit,
        handleCloseEdit,
        handleOpenMenu,
        handleCloseMenu,
        handleHideDownloadPopIn,
        handleNavigateBack,
        handleOpenEmail,
        handleOpenPreview,
        getStatusStyle,
        router,
        width: useWindowDimensions().width
    };
};

export default useInvoiceDetails;

