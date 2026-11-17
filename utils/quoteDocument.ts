import axios from '@/services/api';
import { generateInvoiceHTML } from '@/utils/generateInvoiceHTML';

// Invoice-shaped view of a quote so the existing invoice HTML/PDF renderer can
// be reused (mirrors utils/quotes/quoteInvoiceAdapter.ts on the web).

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export const quoteNotesWithTerms = (quote: any) =>
  [quote?.notes, quote?.terms ? `Terms & Conditions:\n${quote.terms}` : ''].filter(Boolean).join('\n\n');

export const quoteToInvoiceDocument = (quote: any) => {
  const lines: any[] = [...(quote?.items || [])]
    .sort((a, b) => num(a.sortOrder) - num(b.sortOrder))
    .map((i) => {
      const discount = num(i.discount);
      return {
        itemId: i.itemId ?? null,
        title: i.name,
        description: discount > 0 ? [i.description, `Discount: ${Number(discount.toFixed(2))}%`].filter(Boolean).join(' - ') : i.description || '',
        quantity: num(i.quantity),
        rate: num(i.rate),
        amount: num(i.amount),
      };
    });
  const shipping = num(quote?.shipping);
  const adjustment = num(quote?.adjustment);
  if (shipping !== 0) lines.push({ itemId: null, title: 'Shipping', description: '', quantity: 1, rate: shipping, amount: shipping });
  if (adjustment !== 0) lines.push({ itemId: null, title: 'Adjustment', description: '', quantity: 1, rate: adjustment, amount: adjustment });

  return {
    ...quote,
    invoiceNumber: quote?.quoteNumber,
    invoiceDate: quote?.quoteDate,
    dueDate: quote?.expiryDate,
    items: lines,
    subTotal: lines.reduce((s, l) => s + l.amount, 0),
    discountPercent: quote?.discountPercent,
    total: num(quote?.total),
    received: 0,
    remaining: num(quote?.total),
    previousRemaining: 0,
    notes: quoteNotesWithTerms(quote),
  };
};

/** Template config with quote wording, as the web does before rendering. */
export const quoteTemplate = (template: any) => ({
  ...(template || {}),
  invoiceLabel: 'QUOTE',
  invoiceDateLabel: 'Quote Date',
  dueDateLabel: 'Expiry Date',
  balanceDueLabel: 'Total',
  showPreviousDue: false,
});

/** Loads the quote's template (falling back to the default) and renders its HTML. */
export const buildQuoteHtml = async (quote: any): Promise<string> => {
  let template = quote?.template && Object.keys(quote.template).length > 3 ? quote.template : null;
  if (!template) {
    const res = await axios.get('/api/templates');
    const all: any[] = res.data?.templates ?? res.data ?? [];
    template = all.find((t) => t.isDefault) || all[0] || null;
  }
  return generateInvoiceHTML(quoteToInvoiceDocument(quote), quoteTemplate(template));
};
