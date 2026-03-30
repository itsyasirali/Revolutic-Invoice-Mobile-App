export type PaperSize = 'A4' | 'A5' | 'Letter';
export type Orientation = 'Portrait' | 'Landscape';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';
export type FontWeight = 'normal' | 'bold' | 'light';
export type Alignment = 'left' | 'center' | 'right';
export type LayoutStyle = 'compact' | 'spacious' | 'custom';
export type ContentAlignment = 'left' | 'center' | 'justify';
export type PaymentStubPosition = 'bottom' | 'separatePage';
export type ColumnName = 'index' | 'itemName' | 'description' | 'quantity' | 'unit' | 'rate' | 'amount';

export interface TemplateMargins {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface TableColumnSetting {
    columnName: ColumnName;
    visible: boolean;
    width: string;
    alignment: Alignment;
}

export interface Template {
    id: string;
    userId: string;
    templateName: string;
    isDefault: boolean;

    // Paper Settings
    paperSize: PaperSize;
    orientation: Orientation;
    margins: TemplateMargins;
    padding: number;

    // Color Scheme  
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    accentColor: string;
    textColor: string;
    headerTextColor: string;
    invoiceNumberColor: string;
    billToColor: string;
    previousDueColor: string;
    tableHeaderBgColor: string;
    tableHeaderTextColor: string;
    tableRowColor: string;
    tableAltRowColor: string;
    tableBorderColor: string;
    borderColor: string;
    balanceDueTextColor: string;

    // Granular Bill To Styles
    billToNameColor: string;
    billToAddressColor: string;
    billToNameFontSize: number;
    billToAddressFontSize: number;

    // Granular Invoice Details Styles
    invoiceDateLabelColor: string;
    invoiceDateValueColor: string;
    dueDateLabelColor: string;
    dueDateValueColor: string;
    termsLabelColor: string;
    termsValueColor: string;
    invoiceDetailLabelFontSize: number;
    invoiceDetailValueFontSize: number;

    // Typography
    fontFamily: string;
    fontSize: number;
    headingFontSize: number;
    subheadingFontSize: number;
    labelFontSize: number;
    tableFontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: FontWeight;
    headingFontWeight: FontWeight;

    // Logo Settings
    logoUrl?: string;
    logoWidth: number;
    logoHeight: number;
    logoPosition: Alignment;
    logoMarginTop: number;
    logoMarginBottom: number;
    showLogo: boolean;

    // Branding
    brandName: string;
    tagline: string;

    // Border & Spacing
    borderStyle: BorderStyle;
    borderWidth: number;
    sectionSpacing: number;
    fieldSpacing: number;
    tableBorderStyle: BorderStyle;

    // Text Labels
    invoiceLabel: string;
    billToLabel: string;
    invoiceNumberLabel: string;
    invoiceDateLabel: string;
    dueDateLabel: string;
    termsLabel: string;
    itemsLabel: string;
    descriptionLabel: string;
    quantityLabel: string;
    rateLabel: string;
    amountLabel: string;
    subtotalLabel: string;
    taxLabel: string;
    discountLabel: string;
    totalLabel: string;
    notesLabel: string;
    previousDueLabel: string;
    balanceDueLabel: string;

    // Table Configuration
    tableColumnSettings: TableColumnSetting[];
    showTableBorders: boolean;
    showTableHeader: boolean;
    tableHeaderAlignment: Alignment;
    alternateRowColors: boolean;

    // Field Visibility
    showInvoiceNumber: boolean;
    showInvoiceDate: boolean;
    showDueDate: boolean;
    showCustomerEmail: boolean;
    showCustomerPhone: boolean;
    showCustomerAddress: boolean;
    showItemDescription: boolean;
    showItemUnit: boolean;
    showSubtotal: boolean;
    showTax: boolean;
    showDiscount: boolean;
    showShipping: boolean;
    showNotes: boolean;
    showPreviousDue: boolean;

    // Header Section
    headerText?: string;
    headerAlignment: Alignment;
    headerFontSize: number;
    headerFontWeight: FontWeight;
    headerBackgroundColor?: string;
    headerHeight?: number;
    showHeader: boolean;

    // Footer Section
    footerText?: string;
    footerAlignment: Alignment;
    footerFontSize: number;
    footerFontWeight: FontWeight;
    footerBackgroundColor?: string;
    footerHeight?: number;
    showFooter: boolean;
    showPageNumbers: boolean;
    pageNumberFormat: string;

    // Layout Options
    includePaymentStub: boolean;
    paymentStubPosition: PaymentStubPosition;
    layoutStyle: LayoutStyle;
    contentAlignment: ContentAlignment;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface TemplateListItem {
    id: string;
    name: string;
    paperSize: string;
    orientation: string;
    isDefault: boolean;
    createdAt: string;
    raw: Template;
}

export interface UseTemplatesListReturn {
    templates: TemplateListItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
