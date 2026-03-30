import { IP } from "@/utils/IP";

export const generatePaymentHTML = (payment: any, templateConfig: any) => {
    const config = templateConfig || {};

    // --- 1. Settings Extraction ---
    // Colors
    const primaryColor = config.primaryColor || '#FF9608';
    const secondaryColor = config.secondaryColor || '#075056';
    const accentColor = config.accentColor || '#FBBF24';
    const textColor = config.textColor || '#1f2937';
    const backgroundColor = config.backgroundColor || '#ffffff';
    const borderColor = config.borderColor || '#e5e7eb';
    const footerBgColor = config.footerBackgroundColor || '#f9fafb';
    const tableHeaderBgColor = config.tableHeaderBgColor || primaryColor;
    const tableHeaderTextColor = config.tableHeaderTextColor || '#ffffff';
    const tableRowColor = config.tableRowColor || '#fffbeb';
    const tableAltRowColor = config.tableAltRowColor || '#ffffff';

    // Typography settings
    const fontFamily = config.fontFamily || 'Helvetica';
    const fontSize = config.fontSize || 9;
    const headingFontSize = config.headingFontSize || 24;
    const labelFontSize = config.labelFontSize || 9;
    const tableFontSize = config.tableFontSize || 9;

    // Margins (approx px at 96dpi)
    const marginTop = (config.margins?.top || 0.5) * 96;
    const marginBottom = (config.margins?.bottom || 0.5) * 96;
    const marginLeft = (config.margins?.left || 0.5) * 96;
    const marginRight = (config.margins?.right || 0.5) * 96;

    // Paper Size Dimensions
    const paperSizes: Record<string, { width: string; height: string }> = {
        'A4': { width: '210mm', height: '297mm' },
        'A5': { width: '148mm', height: '210mm' },
        'Letter': { width: '216mm', height: '279mm' },
    };
    const paperSizeKey = (config.paperSize || 'A4') as keyof typeof paperSizes;
    const size = paperSizes[paperSizeKey] || paperSizes['A4'];

    // Calculate numeric width in px for viewport (1mm approx 3.78px at 96dpi)
    const widthMm = parseFloat(size.width.replace('mm', ''));
    const numericWidth = Math.round(widthMm * 3.78);

    // Branding
    const logoUrl = config.branding?.logoPreview || (config.logoUrl ? `${IP}${config.logoUrl}` : null);
    const logoPosition = config.logoPosition || 'left';
    const logoWidth = config.logoWidth || 150;
    const showLogo = config.showLogo !== false;

    // Toggles
    const showHeader = config.showHeader || false;
    const showFooter = config.showFooter !== false;
    const showNotes = config.showNotes !== false;

    // Labels
    const labels = {
        title: 'PAYMENT',
        billTo: config.billToLabel || 'Received From',
        date: 'Payment Date',
        mode: 'Payment Mode',
        ref: 'Reference#',
        amount: 'Amount Received',
        notes: config.notesLabel || 'Notes',
        footer: config.footerText || 'Thank you for your business!'
    };

    // Customer Name Logic
    const customerName = payment.customerDisplayName ||
        payment.customerName ||
        payment.customerId?.displayName ||
        payment.customerId?.companyName ||
        'Customer';

    // Address Logic
    const customerAddress = payment.customerAddress ||
        payment.customerId?.address ||
        (payment.customerId?.billingAddress ?
            `${payment.customerId.billingAddress.addressLine1 || ''} ${payment.customerId.billingAddress.city || ''}` : '');

    // --- Table Generation (Applied Invoices) ---
    const rowsHtml = (payment.appliedInvoices || []).map((item: any, idx: number) => {
        const isAlt = config.alternateRowColors !== false && idx % 2 === 0;
        const bg = isAlt ? tableRowColor : tableAltRowColor;

        // Handle both flattened (API transformed) and nested structure if necessary
        const invoiceNum = item.invoiceNumber || item.invoiceId || '—';
        const invoiceAmt = item.invoiceAmount || 0;
        const amount = item.amount || 0;

        return `
            <tr style="border-bottom: 1px solid ${config.tableBorderColor || borderColor}; background-color: ${bg};">
                <td style="padding: 10px; text-align: left; color: ${textColor};">${invoiceNum}</td>
                <td style="padding: 10px; text-align: right; color: ${textColor};">${payment.currency || 'PKR'} ${(Number(invoiceAmt)).toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; color: ${textColor}; width: 120px;">${payment.currency || 'PKR'} ${(Number(amount)).toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    // --- HTML Document ---
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=${numericWidth}, user-scalable=yes" />
            <style>
                @page { margin: 0; size: ${config.paperSize || 'A4'} ${config.orientation || 'portrait'}; }
                body { font-family: '${fontFamily}', Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: ${textColor}; font-size: ${fontSize}px; overflow: hidden; }
                
                .page-container {
                    background-color: ${backgroundColor};
                    width: ${size.width};
                    height: ${size.height};
                    position: relative;
                    margin: 0 auto;
                    box-shadow: none;
                    display: flex;
                    flex-direction: column;
                    padding-top: ${marginTop}px;
                    padding-bottom: ${marginBottom}px;
                    padding-left: ${marginLeft}px;
                    padding-right: ${marginRight}px;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                /* Remove padding when printing/generating PDF */
                @media print {
                    .page-container {
                        padding: 20px 0 0 0;
                    }
                    .footer-section {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        margin-left: 0;
                        margin-right: 0;
                    }
                    .top-bar {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        margin-top: 0 !important;
                    }
                }
                
                /* Header Section */
                .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
                .logo-img { max-width: ${logoWidth}px; max-height: 100px; object-fit: contain; }
                
                .title-block { text-align: right; }
                .doc-title { font-size: ${headingFontSize}px; font-weight: bold; color: ${config.headerTextColor || primaryColor}; margin: 0; letter-spacing: 1px; }
                .doc-number { font-size: 14px; color: ${secondaryColor}; font-weight: bold; margin-top: 4px; }

                /* Meta Section (Bill To + Dates) */
                .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .bill-to { flex: 1; }
                .meta-details { text-align: right; min-width: 200px; }
                .meta-row { display: flex; justify-content: flex-end; margin-bottom: 4px; }
                .meta-label { color: #6b7280; margin-right: 12px; font-size: ${labelFontSize}px; }
                .meta-value { font-weight: 600; font-size: ${labelFontSize}px; }

                /* Table */
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: ${tableFontSize}px; }
                th { text-align: left; padding: 8px 10px; background-color: ${tableHeaderBgColor}; color: ${tableHeaderTextColor}; font-size: ${tableFontSize}px; font-weight: 600; text-transform: uppercase; }
                th.number { text-align: right; }
                
                /* Totals */
                .totals-section { width: 300px; margin-left: auto; margin-top: 20px; }
                .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: ${fontSize}px; }
                .total-line { border-top: 1px solid ${borderColor}; margin-top: 8px; padding-top: 8px; }
                
                .amount-box { 
                    background-color: ${accentColor}; 
                    color: white; 
                    padding: 10px; 
                    border-radius: 4px; 
                    margin-top: 12px; 
                    display: flex; 
                    justify-content: space-between; 
                    font-weight: bold; 
                    font-size: ${fontSize + 2}px;
                }

                /* Notes & Footer */
                .notes-section { margin-top: 40px; white-space: pre-wrap; color: #6b7280; font-size: ${fontSize}px; }
                .footer-section { margin-top: auto; padding-top: 20px; border-top: 1px solid ${borderColor}; text-align: ${config.footerAlignment || 'center'}; font-size: 10px; color: #6b7280; background-color: ${footerBgColor}; padding-left: ${marginLeft}px; padding-right: ${marginRight}px; padding-bottom: 15px; }

                /* Header (Top Bar) Option */
                .top-bar { 
                    background-color: ${config.headerBackgroundColor || 'transparent'}; 
                    text-align: ${config.headerAlignment || 'center'}; 
                    padding: 10px; 
                    margin-left: -${marginLeft}px; 
                    margin-right: -${marginRight}px; 
                    margin-top: -${marginTop}px; /* Pull up to edge */
                    margin-bottom: 20px;
                    font-weight: ${config.headerFontWeight || 'bold'};
                    font-size: ${config.headerFontSize || 14}px;
                }

            </style>
        </head>
        <body>
            <div class="page-container">
                
                ${showHeader ? `<div class="top-bar">${config.headerText || ''}</div>` : ''}

                <!-- Header: Logo & Title -->
                <div class="header-section" style="flex-direction: ${logoPosition === 'right' ? 'row-reverse' : (logoPosition === 'center' ? 'column' : 'row')}; align-items: ${logoPosition === 'center' ? 'center' : 'flex-start'}; text-align: ${logoPosition === 'center' ? 'center' : 'left'};">
                    <div>
                        ${showLogo && logoUrl ?
            `<img src="${logoUrl}" class="logo-img" style="margin-top: ${config.logoMarginTop || 0}px; margin-bottom: ${config.logoMarginBottom || 10}px;" />` :
            `<div style="font-size: 24px; font-weight: bold; color: ${textColor};">${config.branding?.brandName || 'Revolutic'}</div>`
        }
                    </div>
                    <div class="title-block" style="text-align: ${logoPosition === 'center' ? 'center' : 'right'}; margin-top: ${logoPosition === 'center' ? '15px' : '0'};">
                        <h1 class="doc-title">${labels.title}</h1>
                        <div class="doc-number">#${payment.paymentNumber || 'DRAFT'}</div>
                    </div>
                </div>

                <!-- Meta: Received From & Details -->
                <div class="meta-section">
                    <div class="bill-to">
                        <div style="font-weight: bold; color: ${config.billToColor || secondaryColor}; margin-bottom: 4px; font-size: ${labelFontSize}px;">${labels.billTo}</div>
                        <div style="font-weight: 600; font-size: ${fontSize + 1}px;">${customerName}</div>
                        ${config.showCustomerAddress !== false && customerAddress ? `<div style="max-width: 250px; margin-top: 2px; color: ${textColor}; opacity: 0.8;">${customerAddress}</div>` : ''}
                        ${config.showCustomerEmail !== false && (payment.customerEmail || payment.customerId?.email) ? `<div style="color: ${primaryColor}; margin-top: 2px;">${payment.customerEmail || payment.customerId?.email}</div>` : ''}
                    </div>
                    <div class="meta-details">
                        <div class="meta-row">
                            <span class="meta-label">${labels.date}:</span>
                            <span class="meta-value">${new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">${labels.mode}:</span>
                            <span class="meta-value">${payment.paymentMode || payment.paymentMethod}</span>
                        </div>
                        ${payment.reference || payment.referenceNo ? `
                        <div class="meta-row">
                            <span class="meta-label">${labels.ref}:</span>
                            <span class="meta-value">${payment.reference || payment.referenceNo}</span>
                        </div>` : ''}
                    </div>
                </div>

                <!-- Applied Invoices Table -->
                ${payment.appliedInvoices && payment.appliedInvoices.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice Number</th>
                                <th class="number">Invoice Amount</th>
                                <th class="number">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                ` : `<div style="padding: 20px; text-align: center; color: #9ca3af; border: 1px dashed #e5e7eb; border-radius: 8px;">No specific invoices applied (On Account)</div>`}

                <!-- Totals -->
                <div class="totals-section">
                    <div class="total-row">
                        <span>Amount Received</span>
                        <span>${payment.currency || 'PKR'} ${(Number(payment.amountReceived || payment.amount || 0)).toFixed(2)}</span>
                    </div>
                    ${payment.bankCharges > 0 ? `
                    <div class="total-row">
                        <span>Bank Charges</span>
                        <span style="color: #ef4444;">- ${payment.currency || 'PKR'} ${(Number(payment.bankCharges)).toFixed(2)}</span>
                    </div>` : ''}

                    <div class="amount-box">
                        <div class="amount-box-label">Total Received</div>
                        <div class="amount-box-value">${payment.currency || 'PKR'} ${(Number(payment.amountReceived || payment.amount || 0)).toFixed(2)}</div>
                    </div>
                </div>

                <!-- Notes -->
                ${(showNotes && payment.notes) ? `
                    <div class="notes-section">
                        <div style="font-weight: bold; margin-bottom: 4px; color: ${secondaryColor};">${labels.notes}</div>
                        ${payment.notes}
                    </div>
                ` : ''}

                <div style="flex-grow: 1;"></div>

                <!-- Footer -->
                ${showFooter ? `
                    <div class="footer-section">
                        ${labels.footer}
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
};
