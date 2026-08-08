
import { IP } from "@/utils/IP";

export const generateInvoiceHTML = (invoice: any, templateConfig: any) => {
  const config = templateConfig || {};
  const formatNumber = (num: any) => {
    const n = Number(num);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  };

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

  // Typography
  const fontFamily = config.fontFamily || 'Helvetica';
  const fontSize = config.fontSize || 9;
  const headingFontSize = config.headingFontSize || 24;
  const labelFontSize = config.labelFontSize || 9;
  const tableFontSize = config.tableFontSize || 9;

  // Layout values (margins in inches typically, converting to pixels roughly for preview)
  const marginTop = (config.margins?.top || 0.5) * 96;
  const marginBottom = (config.margins?.bottom || 0.5) * 96;
  const marginLeft = (config.margins?.left || 0.5) * 96;
  const marginRight = (config.margins?.right || 0.5) * 96;

  // Paper Size Dimensions (approx px at 96dpi)
  // Paper Size Dimensions (mm)
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
  const showTax = config.showTax || false;
  const showDiscount = config.showDiscount || false;
  const showNotes = config.showNotes !== false;
  const showPreviousDue = config.showPreviousDue !== false;

  // Labels
  const labels = {
    invoice: config.invoiceLabel ?? 'INVOICE',
    billTo: config.billToLabel || 'Bill To',
    date: config.invoiceDateLabel || 'Date',
    due: config.dueDateLabel || 'Due',
    subtotal: config.subtotalLabel || 'Sub Total',
    tax: config.taxLabel || 'Tax',
    discount: config.discountLabel || 'Discount',
    total: config.totalLabel || 'Total',
    balance: config.balanceDueLabel || 'Balance Due',
    notes: config.notesLabel || 'Notes',
    prevDue: config.previousDueLabel || 'Previous Remaining'
  };

  // --- 2. Dynamic Table Columns ---
  // Default columns if not provided
  const defaultColumns = [
    { columnName: 'itemName', label: 'Item', visible: true, width: '30%', alignment: 'left' },
    { columnName: 'quantity', label: 'Qty', visible: true, width: '10%', alignment: 'center' },
    { columnName: 'rate', label: 'Rate', visible: true, width: '15%', alignment: 'right' },
    { columnName: 'amount', label: 'Amount', visible: true, width: '15%', alignment: 'right' },
  ];

  let columns = config.tableColumnSettings || defaultColumns;
  // Filter visible only
  columns = columns.filter((c: any) => c.visible !== false);

  // Helper to get cell value
  const getCellValue = (item: any, colName: string) => {
    switch (colName) {
      case 'itemName': return `<strong>${item.title || item.itemName || 'Item'}</strong>${config.showItemDescription !== false && item.description ? `<br/><span style="color: #6b7280; font-size: 85%;">${item.description}</span>` : ''}`;
      case 'description': return item.description || '';
      case 'quantity': return item.quantity || 0;
      case 'rate': return (item.rate || item.unitPrice || 0);
      case 'amount': return formatNumber(item.amount || item.totalPrice);
      case 'unit': return item.unit || '';
      default: return '';
    }
  };

  // Build Table Header
  const tableHeaderHtml = columns.map((col: any) =>
    `<th style="width: ${col.width || 'auto'}; text-align: ${col.alignment || 'left'}; padding: 8px;">${col.label || col.columnName}</th>`
  ).join('');

  // Build Table Rows
  const itemsRows = (invoice.items || []).map((item: any, idx: number) => {
    const isAlt = config.alternateRowColors !== false && idx % 2 === 0;
    const bg = isAlt ? tableRowColor : tableAltRowColor;

    const cells = columns.map((col: any) => `
            <td style="padding: 10px; text-align: ${col.alignment || 'left'}; color: ${textColor};">
                ${getCellValue(item, col.columnName)}
            </td>
        `).join('');

    return `<tr style="border-bottom: 1px solid ${config.tableBorderColor || borderColor}; background-color: ${bg};">${cells}</tr>`;
  }).join('');


  // --- 3. HTML Structure ---
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

          /* General Layout */
          .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .logo-img { max-width: ${logoWidth}px; max-height: 100px; object-fit: contain; }
          
          .invoice-labels { text-align: right; }
          .invoice-title { font-size: ${headingFontSize}px; font-weight: bold; color: ${config.headerTextColor || primaryColor}; margin: 0; letter-spacing: 1px; }
          .invoice-sub { font-size: 14px; color: ${secondaryColor}; font-weight: bold; margin-top: 4px; }

          .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .bill-to-block { flex: 1; }
          .dates-block { text-align: right; min-width: 200px; }
          .date-row { display: flex; justify-content: flex-end; margin-bottom: 4px; }
          .date-label { color: #6b7280; margin-right: 12px; font-size: ${labelFontSize}px; }
          .date-value { font-weight: 600; font-size: ${labelFontSize}px; }

          /* Table */
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: ${tableFontSize}px; }
          th { background-color: ${tableHeaderBgColor}; color: ${tableHeaderTextColor}; font-size: ${tableFontSize}px; font-weight: 600; text-transform: uppercase; }
          
          /* Totals */
          .totals-section { width: 300px; margin-left: auto; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: ${fontSize}px; }
          .total-line { border-top: 1px solid ${borderColor}; margin-top: 8px; padding-top: 8px; }
          .balance-box { background-color: ${accentColor}; color: white; padding: 10px; border-radius: 4px; margin-top: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: ${fontSize + 2}px; }

          /* Notes & Footer */
          .notes-section { margin-top: 40px; white-space: pre-wrap; color: #6b7280; font-size: ${fontSize}px; }
          .footer-section { margin-top: auto; padding-top: 20px; border-top: 1px solid ${borderColor}; text-align: ${config.footerAlignment || 'center'}; font-size: 10px; color: #6b7280; background-color: ${footerBgColor}; padding-left: ${marginLeft}px; padding-right: ${marginRight}px; padding-bottom: 10px; }

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

          <div class="header-section" style="flex-direction: ${logoPosition === 'right' ? 'row-reverse' : (logoPosition === 'center' ? 'column' : 'row')}; align-items: ${logoPosition === 'center' ? 'center' : 'flex-start'}; text-align: ${logoPosition === 'center' ? 'center' : 'left'};">
            <div>
               ${showLogo && logoUrl ?
      `<img src="${logoUrl}" class="logo-img" style="margin-top: ${config.logoMarginTop || 0}px; margin-bottom: ${config.logoMarginBottom || 10}px;" />` :
      `<div class="brand-name" style="font-size: 26px; font-weight: bold; color: ${textColor};">${config.branding?.brandName || 'Revolutic'}</div><div style="font-size: 12px; color: ${primaryColor};">${config.branding?.tagline || ''}</div>`
    }
            </div>
            
            <div class="invoice-labels" style="text-align: ${logoPosition === 'center' ? 'center' : 'right'}; margin-top: ${logoPosition === 'center' ? '20px' : '0'};">
              <h1 class="invoice-title">${labels.invoice}</h1>
              ${config.showInvoiceNumber !== false ? `<div class="invoice-sub">#${invoice.invoiceNumber}</div>` : ''}
            </div>
          </div>

          <div class="meta-section">
            <div class="bill-to-block">
                <div style="font-weight: bold; color: ${config.billToColor || secondaryColor}; margin-bottom: 4px; font-size: ${labelFontSize}px;">${labels.billTo}</div>
                <div style="font-weight: 600; font-size: ${fontSize + 1}px;">
                    ${invoice.customerName || invoice.customerDisplayName || invoice.customerId?.displayName || invoice.customerId?.name || 'Customer'}
                </div>
                ${config.showCustomerAddress !== false ?
      `<div style="max-width: 250px; margin-top: 2px;">
                        ${invoice.customerAddress || (invoice.customerId?.billingAddress ? `${invoice.customerId.billingAddress.addressLine1 || ''} ${invoice.customerId.billingAddress.city || ''}` : '') || invoice.customerId?.address || ''}
                    </div>` : ''}
                ${config.showCustomerEmail !== false && (invoice.customerEmail || invoice.customerId?.email) ? `<div>${invoice.customerEmail || invoice.customerId?.email}</div>` : ''}
                ${config.showCustomerPhone !== false && (invoice.customerPhone || invoice.customerId?.phone) ? `<div>${invoice.customerPhone || invoice.customerId?.phone}</div>` : ''}
            </div>

            <div class="dates-block">
               ${config.showInvoiceDate !== false ?
      `<div class="date-row"><span class="date-label">${labels.date}:</span><span class="date-value">${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : ''}</span></div>` : ''
    }
               ${config.showDueDate !== false ?
      `<div class="date-row"><span class="date-label">${labels.due}:</span><span class="date-value">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</span></div>` : ''
    }
            </div>
          </div>

          <table>
            <thead>
              <tr>${tableHeaderHtml}</tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>

          <div class="totals-section">
             ${config.showSubtotal !== false ?
      `<div class="total-row"><span class="total-label">${labels.subtotal}</span><span class="total-value">${invoice.currency || ''} ${formatNumber(invoice.subTotal)}</span></div>` : ''
    }
             ${showTax ?
      `<div class="total-row"><span class="total-label">${labels.tax}</span><span class="total-value">${invoice.currency || ''} 0.00</span></div>` : ''
    }
             ${showDiscount ?
      `<div class="total-row"><span class="total-label">${labels.discount}</span><span class="total-value">${invoice.discountPercent || 0}%</span></div>` : ''
    }
             <div class="total-row total-line">
                <span class="total-label" style="font-weight: bold; font-size: ${fontSize + 2}px; color: ${textColor};">${labels.total}</span>
                <span class="total-value" style="font-weight: bold; font-size: ${fontSize + 2}px; color: ${config.headerTextColor || primaryColor};">${invoice.currency || ''} ${formatNumber(invoice.total)}</span>
             </div>
             
             ${showPreviousDue ?
      `<div class="total-row" style="margin-top: 6px;"><span class="total-label">${labels.prevDue}</span><span class="total-value" style="color: ${config.previousDueColor || secondaryColor};">${invoice.currency || ''} ${formatNumber(invoice.previousRemaining)}</span></div>` : ''
    }

             <div class="balance-box">
                <span>${labels.balance}</span>
                <span>${invoice.currency || ''} ${formatNumber(Number(invoice.total || 0) + Number(invoice.previousRemaining || 0))}</span>
             </div>
          </div>

          ${(showNotes && invoice.notes) ? `
             <div class="notes-section">
                <div style="font-weight: bold; margin-bottom: 4px;">${labels.notes}</div>
                ${invoice.notes}
             </div>
          ` : ''}

          <div style="flex-grow: 1;"></div>

          ${showFooter ? `
            <div class="footer-section">
               ${config.footerText || `Powered by <span style="color: ${primaryColor}; font-weight: bold;">Revolutic</span>`}
            </div>
          ` : ''}
        
        </div>
      </body>
      </html>
    `;
};
