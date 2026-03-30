import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '@/services/api';
import { Invoice } from '@/types/invoice';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, useWindowDimensions, Platform, PermissionsAndroid } from 'react-native';
import { savePDFToDevice } from "@/app/utils/fileSystem";
import { useInvoiceDelete } from './useInvoiceDelete';
import * as Print from "expo-print";
import { generateInvoiceHTML } from "@/app/utils/generateInvoiceHTML";


export const useInvoiceDetails = () => {
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

    return {
        // State
        invoiceData,
        loading,
        error,
        showEditForm,
        showMenu,
        expandMoreInfo,

        // Setters
        setShowEditForm,
        setShowMenu,
        setExpandMoreInfo,
        setDownloadSuccess,

        // Status
        downloadSuccess,
        downloadFileName,

        // Actions
        handleSaveSuccess,
        handleDelete,
        handleDownloadPDF,
        router, // for back nav
        width: useWindowDimensions().width
    };
};

export default useInvoiceDetails;
