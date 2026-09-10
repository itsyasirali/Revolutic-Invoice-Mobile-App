import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import usePaymentDelete from './usePaymentDelete';
import { generatePaymentHTML } from '@/utils/generatePaymentHTML';
import { savePDFToDevice } from '@/utils/fileSystem';
import useTemplatesList from '../templates/useTemplatesList';

const usePaymentDetails = () => {
    const { payment } = useLocalSearchParams();
    const router = useRouter();
    const { deletePayment } = usePaymentDelete();
    const { templates } = useTemplatesList();

    // 1. Initial Data from Params
    const [paymentData, setPaymentData] = useState<any>(() => {
        try {
            return payment ? JSON.parse(Array.isArray(payment) ? payment[0] : payment) : null;
        } catch (e) {
            console.error("Failed to parse payment data", e);
            return null;
        }
    });

    // 2. UI State
    const [showEditForm, setShowEditForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false); // For async ops like PDF
    const [expandMoreInfo, setExpandMoreInfo] = useState(true);

    // 3. Handlers
    const handleSaveSuccess = async (savedPayment: any) => {
        if (savedPayment) {
            setPaymentData(savedPayment);
        }
        setShowEditForm(false);
        Alert.alert("Success", "Payment updated");
    };

    const handleDelete = () => {
        Alert.alert("Delete", "Are you sure you want to delete this payment?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const result = await deletePayment(paymentData.id);
                    if (result.success) router.back();
                    else Alert.alert("Error", result.error || "Delete failed");
                },
            },
        ]);
        setShowMenu(false);
    };

    const handleDownloadReceipt = async () => {
        setShowMenu(false);
        try {
            setLoading(true);
            const templateObj = paymentData.templateId || null;
            const templateConfig = (templateObj && typeof templateObj === 'object')
                ? (templateObj.design || templateObj.config || templateObj)
                : templateObj;

            const html = generatePaymentHTML(paymentData, templateConfig);
            const { uri } = await Print.printToFileAsync({ html });
            const fileName = `Receipt-${paymentData.paymentNumber || 'draft'}.pdf`;
            await savePDFToDevice(uri, fileName);
        } catch (error) {
            console.error("Download Receipt Error:", error);
            Alert.alert("Error", "Failed to generate receipt");
        } finally {
            setLoading(false);
        }
    };

    // Navigation Handlers
    const handleEdit = () => {
        setShowMenu(false); // Close menu if open (though usually called from icon)
        setShowEditForm(true);
    };

    const handlePreview = () => {
        setShowMenu(false);

        // Ensure template is populated
        let dataToPass = { ...paymentData };
        if (dataToPass.templateId && typeof dataToPass.templateId !== 'object') {
            const foundTemplate = templates.find((t: any) => t.id === dataToPass.templateId || t.id === dataToPass.templateId);
            if (foundTemplate) {
                dataToPass.templateId = foundTemplate.raw || foundTemplate;
            }
        }

        router.push({
            pathname: "/screens/payments/preview",
            params: { paymentData: JSON.stringify(dataToPass) }
        });
    };

    const handleSendEmail = () => {
        setShowMenu(false);

        // Ensure template is populated
        let dataToPass = { ...paymentData };
        if (dataToPass.templateId && typeof dataToPass.templateId !== 'object') {
            const foundTemplate = templates.find((t: any) => t.id === dataToPass.templateId || t.id === dataToPass.templateId);
            if (foundTemplate) {
                dataToPass.templateId = foundTemplate.raw || foundTemplate;
            }
        }

        router.push({
            pathname: "/screens/payments/email",
            params: {
                paymentId: paymentData.id,
                paymentData: JSON.stringify(dataToPass)
            }
        });
    };

    const getStatusStyle = (status: string) => {
        const normalizedStatus = (status || "").toLowerCase();
        switch (normalizedStatus) {
            case "cash":
                return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    icon: "cash" as const,
                    hex: "#047857",
                };
            case "bank transfer":
                return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    icon: "business" as const,
                    hex: "#1d4ed8",
                };
            case "credit card":
                return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    icon: "card" as const,
                    hex: "#7e22ce",
                };
            case "check":
                return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    icon: "document-text" as const,
                    hex: "#0f766e",
                };
            case "other":
                return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    icon: "pricetag" as const,
                    hex: "#374151",
                };
            default:
                return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    icon: "help-circle" as const,
                    hex: "#374151",
                };
        }
    };

    const statusStyle = getStatusStyle(paymentData?.paymentMode);

    const customerDisplayName =
        paymentData?.customerDisplayName ||
        paymentData?.customer?.displayName ||
        "Unknown Customer";

    const customerInitial = (
        paymentData?.customerDisplayName ||
        paymentData?.customer?.id ||
        "C"
    )?.charAt(0).toUpperCase();

    const customerEmail =
        paymentData?.customerEmail ||
        (typeof paymentData?.customerId === "object"
            ? paymentData?.customerId?.email ||
              paymentData?.customerId?.contacts?.[0]?.email
            : "");

    const formattedAmount = Number(paymentData?.amountReceived || 0).toFixed(2);
    const formattedPaymentDate = paymentData?.paymentDate ? new Date(paymentData.paymentDate).toLocaleDateString() : "";

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

    const goBack = () => router.back();

    return {
        paymentData,
        loading,
        showEditForm,
        setShowEditForm,
        showMenu,
        setShowMenu,
        expandMoreInfo,
        setExpandMoreInfo,
        statusStyle,
        customerDisplayName,
        customerInitial,
        customerEmail,
        formattedAmount,
        formattedPaymentDate,
        handleOpenEdit,
        handleCloseEdit,
        handleOpenMenu,
        handleCloseMenu,
        handleSaveSuccess,
        handleDelete,
        handleDownloadReceipt,
        handleEdit,
        handlePreview,
        handleSendEmail,
        goBack
    };
};

export default usePaymentDetails;
