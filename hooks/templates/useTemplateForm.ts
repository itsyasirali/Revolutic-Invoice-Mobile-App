import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { TemplateFormData, UseTemplateFormReturn, AlertState } from '../../types/template.d';
import { API_URL } from '../../utils/APIURL';
const DEFAULT_FORM_DATA: TemplateFormData = {
    templateName: '',
    isDefault: false,

    // Paper
    paperSize: 'A4',
    orientation: 'Portrait',
    marginTop: 0.7,
    marginBottom: 0.7,
    marginLeft: 0.55,
    marginRight: 0.4,
    padding: 10,

    // Colors - Matching generateInvoicePDF.ts design
    primaryColor: '#FF9608',      // Orange - for INVOICE title and table header
    secondaryColor: '#075056',    // Teal - for invoice number and Bill To
    backgroundColor: '#ffffff',
    accentColor: '#FBBF24',       // Yellow - for Balance Due box background
    textColor: '#1f2937',         // Dark text
    headerTextColor: '#FF9608',   // Orange for INVOICE title
    invoiceNumberColor: '#075056', // Teal - Default
    billToColor: '#075056',        // Teal - Default
    previousDueColor: '#075056',   // Teal - Default
    borderColor: '#e5e7eb',       // Gray border
    balanceDueTextColor: '#EE5858', // Red - for Balance Due text

    // Granular Bill To Styles
    billToNameColor: '#075056',
    billToAddressColor: '#075056',
    billToNameFontSize: 12,
    billToAddressFontSize: 10,

    // Granular Invoice Details Styles
    invoiceDateLabelColor: '#6b7280',
    invoiceDateValueColor: '#1f2937',
    dueDateLabelColor: '#6b7280',
    dueDateValueColor: '#1f2937',
    termsLabelColor: '#6b7280',
    termsValueColor: '#1f2937',
    invoiceDetailLabelFontSize: 10,
    invoiceDetailValueFontSize: 10,
    tableHeaderBgColor: '#FF9608', // Orange table header
    tableHeaderTextColor: '#ffffff', // White text on orange header
    tableRowColor: '#fffbeb',     // Light yellow alternating row
    tableAltRowColor: '#ffffff',  // White row
    tableBorderColor: '#e5e7eb',  // Gray border

    // Typography
    fontFamily: 'Helvetica',
    fontSize: 10,
    headingFontSize: 20,
    subheadingFontSize: 13,
    labelFontSize: 10,
    tableFontSize: 10,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 'normal',
    headingFontWeight: 'bold',

    // Logo
    logoWidth: 180,
    logoHeight: 80,
    logoPosition: 'left',
    logoMarginTop: 0,
    logoMarginBottom: 10,
    showLogo: true,

    // Branding
    brandName: '',
    tagline: '',

    // Borders
    borderStyle: 'solid',
    borderWidth: 1,
    sectionSpacing: 15,
    fieldSpacing: 5,
    tableBorderStyle: 'solid',

    // Labels - Matching PDF design
    invoiceLabel: 'INVOICE',
    billToLabel: 'Bill To',
    invoiceNumberLabel: 'Invoice#',
    invoiceDateLabel: 'Invoice Date',
    dueDateLabel: 'Due Date',
    termsLabel: 'Terms',
    itemsLabel: 'Item & Description',
    descriptionLabel: 'Description',
    quantityLabel: 'Hours',
    rateLabel: 'Rate',
    amountLabel: 'Amount',
    subtotalLabel: 'Sub Total',
    taxLabel: 'Tax',
    discountLabel: 'Discount',
    totalLabel: 'Total',
    notesLabel: 'Notes',
    previousDueLabel: 'Previous Remaining',
    balanceDueLabel: 'Balance Due',

    // Table
    tableColumnSettings: [
        { columnName: 'index', visible: true, width: '5%', alignment: 'center' },
        { columnName: 'itemName', visible: true, width: '40%', alignment: 'left' },
        { columnName: 'quantity', visible: true, width: '15%', alignment: 'center' },
        { columnName: 'rate', visible: true, width: '20%', alignment: 'right' },
        { columnName: 'amount', visible: true, width: '20%', alignment: 'right' },
    ],
    showTableBorders: true,
    showTableHeader: true,
    tableHeaderAlignment: 'left',
    alternateRowColors: true,

    // Field Visibility
    showInvoiceNumber: true,
    showInvoiceDate: true,
    showDueDate: true,
    showCustomerEmail: false,
    showCustomerPhone: false,
    showCustomerAddress: true,
    showItemDescription: true,
    showItemUnit: false,
    showSubtotal: true,
    showTax: false,
    showDiscount: true,
    showShipping: false,
    showNotes: true,
    showPreviousDue: true,

    // Header
    headerText: '',
    headerAlignment: 'left',
    headerFontSize: 14,
    headerFontWeight: 'bold',
    headerBackgroundColor: '',
    headerHeight: 0,
    showHeader: true,

    // Footer
    footerText: 'Powered by Revolutic — Smart Invoicing',
    footerAlignment: 'center',
    footerFontSize: 9,
    footerFontWeight: 'normal',
    footerBackgroundColor: '#f9fafb',
    footerHeight: 72,
    showFooter: true,
    showPageNumbers: false,
    pageNumberFormat: 'Page {n} of {total}',

    // Layout
    includePaymentStub: false,
    paymentStubPosition: 'bottom',
    layoutStyle: 'spacious',
    contentAlignment: 'left',
};

const useTemplateForm = (templateId?: string): UseTemplateFormReturn => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        type: 'info',
        message: '',
    });

    // Fetch template data if ID is provided
    useEffect(() => {
        if (!templateId) return;

        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/templates/${templateId}`, {
                    withCredentials: true,
                });

                const data = response.data;

                // Map API response to form data structure
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    // Handle nested objects if necessary
                    marginTop: data.margins?.top || prev.marginTop,
                    marginBottom: data.margins?.bottom || prev.marginBottom,
                    marginLeft: data.margins?.left || prev.marginLeft,
                    marginRight: data.margins?.right || prev.marginRight,
                    // Ensure table settings are preserved
                    tableColumnSettings: data.tableColumnSettings || prev.tableColumnSettings,
                }));
            } catch (err: any) {
                console.error('Error fetching template:', err);
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Failed to load template data',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [templateId]);

    const handleChange = (field: keyof TemplateFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (file: File) => {
        setFormData(prev => ({ ...prev, logoFile: file }));
    };

    const handleSubmit = async (setAsDefault = false) => {
        try {
            setLoading(true);

            const submitData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'logoFile') return; // Handle separately
                if (key === 'tableColumnSettings') {
                    submitData.append(key, JSON.stringify(value));
                } else {
                    submitData.append(key, value.toString());
                }
            });

            // Add margins as nested object
            submitData.set('margins', JSON.stringify({
                top: formData.marginTop,
                bottom: formData.marginBottom,
                left: formData.marginLeft,
                right: formData.marginRight,
            }));

            if (setAsDefault) {
                submitData.set('isDefault', 'true');
            }

            // Add logo file if exists
            if (formData.logoFile) {
                submitData.append('logo', formData.logoFile);
            }

            let response;
            if (templateId) {
                response = await axios.put(
                    `${API_URL}/api/templates/${templateId}`,
                    submitData,
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
            } else {
                response = await axios.post(
                    `${API_URL}/api/templates`,
                    submitData,
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
            }

            setAlert({
                show: true,
                type: 'success',
                message: `Template ${templateId ? 'updated' : 'created'} successfully`,
            });

            setTimeout(() => {
                navigate('/templates');
            }, 1500);
        } catch (err: any) {
            console.error('Error submitting template:', err);
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to save template',
            });
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = () => {
        setAlert({ show: false, type: 'info', message: '' });
    };

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA);
    };

    return {
        formData,
        handleChange,
        handleLogoUpload,
        handleSubmit,
        loading,
        alert,
        dismissAlert,
        resetForm,
    };
};

export default useTemplateForm;
