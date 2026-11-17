import { useListMenu, type ExportColumn, type SortField } from './useListMenu';
import { formatDate } from '@/utils/money';

// Sort fields and export columns per list, mirroring the web (hooks/common/listMenus.tsx).

const time = (v: unknown) => {
  const t = v ? new Date(String(v)).getTime() : NaN;
  return Number.isNaN(t) ? null : t;
};
const customerLabel = (c?: { displayName?: string; companyName?: string } | null) => c?.displayName || c?.companyName || '';

type Row = any;

/* customers */
const customerSort: SortField<Row>[] = [
  { label: 'Name', value: 'name', get: (c) => c.displayName },
  { label: 'Company Name', value: 'company', get: (c) => c.companyName },
  { label: 'Receivables', value: 'receivables', get: (c) => Number(c.receivables ?? 0) },
  { label: 'Created Time', value: 'created', get: (c) => time(c.createdAt) },
];
const additionalContacts = (c: Row) =>
  (c.contacts ?? [])
    .slice(1)
    .map((p: Row) => [`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(), p.email ? `<${p.email}>` : '', p.contact ?? ''].filter(Boolean).join(' '))
    .filter(Boolean)
    .join('; ');
const customerExport: ExportColumn<Row>[] = [
  { header: 'Display Name', get: (c) => c.displayName },
  { header: 'Company Name', get: (c) => c.companyName },
  { header: 'Customer Type', get: (c) => c.customerType },
  { header: 'Contact First Name', get: (c) => c.contacts?.[0]?.firstName },
  { header: 'Contact Last Name', get: (c) => c.contacts?.[0]?.lastName },
  { header: 'Contact Email', get: (c) => c.contacts?.[0]?.email },
  { header: 'Contact Phone', get: (c) => c.contacts?.[0]?.contact },
  { header: 'Additional Contacts', get: additionalContacts },
  { header: 'Currency', get: (c) => c.currency },
  { header: 'Status', get: (c) => c.status },
  { header: 'Receivables', get: (c) => c.receivables },
  { header: 'Address', get: (c) => c.address },
  { header: 'Created Time', get: (c) => formatDate(c.createdAt) },
];
export const useCustomerListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: customerSort, exportColumns: customerExport, filename: 'customers', importKind: 'contacts', importLabel: 'Import Customers', onRefresh });

/* items */
const itemSort: SortField<Row>[] = [
  { label: 'Name', value: 'name', get: (i) => i.name },
  { label: 'Selling Price', value: 'price', get: (i) => Number(i.sellingPrice ?? 0) },
  { label: 'Unit', value: 'unit', get: (i) => i.unit },
  { label: 'Created Time', value: 'created', get: (i) => time(i.createdAt) },
];
const itemExport: ExportColumn<Row>[] = [
  { header: 'Item Name', get: (i) => i.name },
  { header: 'Type', get: (i) => i.type },
  { header: 'Unit', get: (i) => i.unit },
  { header: 'Selling Price', get: (i) => i.sellingPrice },
  { header: 'Description', get: (i) => i.description },
  { header: 'Status', get: (i) => i.status },
];
export const useItemListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: itemSort, exportColumns: itemExport, filename: 'items', importKind: 'items', importLabel: 'Import Items', onRefresh });

/* invoices (list items are { invoiceNumber, customerName, date, dueDate, amount, currency, status, raw }) */
const invoiceSort: SortField<Row>[] = [
  { label: 'Invoice Number', value: 'number', get: (i) => i.invoiceNumber },
  { label: 'Customer Name', value: 'customer', get: (i) => i.customerName },
  { label: 'Date', value: 'date', get: (i) => time(i.date) },
  { label: 'Due Date', value: 'due', get: (i) => time(i.dueDate) },
  { label: 'Amount', value: 'amount', get: (i) => Number(i.amount ?? 0) },
];
const invoiceExport: ExportColumn<Row>[] = [
  { header: 'Invoice Number', get: (i) => i.invoiceNumber },
  { header: 'Customer Name', get: (i) => i.customerName },
  { header: 'Email', get: (i) => i.raw?.customer?.contacts?.[0]?.email ?? i.raw?.customerEmail },
  { header: 'Date', get: (i) => formatDate(i.date) },
  { header: 'Due Date', get: (i) => formatDate(i.dueDate) },
  { header: 'Amount', get: (i) => i.amount },
  { header: 'Currency', get: (i) => i.currency },
  { header: 'Status', get: (i) => i.status },
];
export const useInvoiceListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: invoiceSort, exportColumns: invoiceExport, filename: 'invoices', importKind: 'invoices', importLabel: 'Import Invoices', onRefresh });

/* payments */
const paymentName = (p: Row) => p.customerDisplayName || customerLabel(p.customer);
const paymentSort: SortField<Row>[] = [
  { label: 'Date', value: 'date', get: (p) => time(p.paymentDate) },
  { label: 'Payment Number', value: 'number', get: (p) => Number(p.paymentNumber ?? 0) },
  { label: 'Customer Name', value: 'customer', get: paymentName },
  { label: 'Amount', value: 'amount', get: (p) => Number(p.amountReceived ?? p.amount ?? 0) },
];
const paymentExport: ExportColumn<Row>[] = [
  { header: 'Date', get: (p) => formatDate(p.paymentDate) },
  { header: 'Payment Number', get: (p) => p.paymentNumber },
  { header: 'Reference Number', get: (p) => p.referenceNo ?? p.reference },
  { header: 'Customer Name', get: paymentName },
  { header: 'Payment Mode', get: (p) => p.paymentMode ?? p.paymentMethod },
  { header: 'Amount', get: (p) => p.amountReceived ?? p.amount },
  { header: 'Bank Charges', get: (p) => p.bankCharges },
  { header: 'Currency', get: (p) => p.currency },
  { header: 'Status', get: (p) => p.status },
];
export const usePaymentListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: paymentSort, exportColumns: paymentExport, filename: 'payments', importKind: 'payments', importLabel: 'Import Payments', onRefresh });

/* quotes */
const quoteSort: SortField<Row>[] = [
  { label: 'Quote Number', value: 'number', get: (q) => q.quoteNumber },
  { label: 'Customer Name', value: 'customer', get: (q) => customerLabel(q.customer) },
  { label: 'Date', value: 'date', get: (q) => time(q.quoteDate) },
  { label: 'Expiry Date', value: 'expiry', get: (q) => time(q.expiryDate) },
  { label: 'Amount', value: 'amount', get: (q) => Number(q.total ?? 0) },
];
const quoteExport: ExportColumn<Row>[] = [
  { header: 'Quote Number', get: (q) => q.quoteNumber },
  { header: 'Customer Name', get: (q) => customerLabel(q.customer) },
  { header: 'Date', get: (q) => formatDate(q.quoteDate) },
  { header: 'Expiry Date', get: (q) => formatDate(q.expiryDate) },
  { header: 'Reference', get: (q) => q.referenceNumber },
  { header: 'Total', get: (q) => q.total },
  { header: 'Currency', get: (q) => q.currency },
  { header: 'Status', get: (q) => q.status },
];
export const useQuoteListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: quoteSort, exportColumns: quoteExport, filename: 'quotes', importKind: 'quotes', importLabel: 'Import Quotes', onRefresh });

/* projects */
const projectSort: SortField<Row>[] = [
  { label: 'Project Name', value: 'name', get: (p) => p.name },
  { label: 'Project Code', value: 'code', get: (p) => p.projectNumber },
  { label: 'Customer Name', value: 'customer', get: (p) => customerLabel(p.customer) },
  { label: 'Status', value: 'status', get: (p) => p.status },
  { label: 'Created Time', value: 'created', get: (p) => time(p.createdAt) },
];
const projectExport: ExportColumn<Row>[] = [
  { header: 'Project Name', get: (p) => p.name },
  { header: 'Project Code', get: (p) => p.projectNumber },
  { header: 'Customer Name', get: (p) => customerLabel(p.customer) },
  { header: 'Status', get: (p) => p.status },
  { header: 'Billing Method', get: (p) => p.billingMethod },
  { header: 'Hourly Rate', get: (p) => p.hourlyRate },
  { header: 'Fixed Amount', get: (p) => p.fixedAmount },
  { header: 'Budget Hours', get: (p) => p.budgetHours },
  { header: 'Budget Amount', get: (p) => p.budgetAmount },
  { header: 'Currency', get: (p) => p.currency },
  { header: 'Description', get: (p) => p.description },
];
export const useProjectListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: projectSort, exportColumns: projectExport, filename: 'projects', importKind: 'projects', importLabel: 'Import Projects', onRefresh });

/* expenses */
const expenseSort: SortField<Row>[] = [
  { label: 'Date', value: 'date', get: (e) => time(e.expenseDate) },
  { label: 'Expense #', value: 'number', get: (e) => e.expenseNumber },
  { label: 'Vendor', value: 'vendor', get: (e) => e.vendor },
  { label: 'Customer Name', value: 'customer', get: (e) => customerLabel(e.customer) },
  { label: 'Category', value: 'category', get: (e) => e.category?.name },
  { label: 'Amount', value: 'amount', get: (e) => Number(e.total ?? 0) },
  { label: 'Status', value: 'status', get: (e) => e.status },
];
const expenseExport: ExportColumn<Row>[] = [
  { header: 'Expense #', get: (e) => e.expenseNumber },
  { header: 'Date', get: (e) => formatDate(e.expenseDate) },
  { header: 'Vendor', get: (e) => e.vendor },
  { header: 'Customer', get: (e) => customerLabel(e.customer) },
  { header: 'Category', get: (e) => e.category?.name },
  { header: 'Description', get: (e) => e.description },
  { header: 'Amount', get: (e) => e.amount },
  { header: 'Tax', get: (e) => e.tax },
  { header: 'Total', get: (e) => e.total },
  { header: 'Currency', get: (e) => e.currency },
  { header: 'Payment Method', get: (e) => e.paymentMethod },
  { header: 'Reference', get: (e) => e.referenceNumber },
  { header: 'Billable', get: (e) => (e.billable ? 'Yes' : 'No') },
  { header: 'Status', get: (e) => e.status },
];
export const useExpenseListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: expenseSort, exportColumns: expenseExport, filename: 'expenses', importKind: 'expenses', importLabel: 'Import Expenses', onRefresh });

/* time entries (the web has no time import) */
const timeSort: SortField<Row>[] = [
  { label: 'Date', value: 'date', get: (t) => time(t.date) },
  { label: 'Entry Number', value: 'number', get: (t) => t.entryNumber },
  { label: 'Project', value: 'project', get: (t) => t.project },
  { label: 'Customer Name', value: 'customer', get: (t) => customerLabel(t.customer) },
  { label: 'Duration', value: 'duration', get: (t) => Number(t.duration ?? 0) },
  { label: 'Amount', value: 'amount', get: (t) => Number(t.amount ?? 0) },
];
const timeExport: ExportColumn<Row>[] = [
  { header: 'Entry Number', get: (t) => t.entryNumber },
  { header: 'Date', get: (t) => formatDate(t.date) },
  { header: 'Start', get: (t) => t.startTime },
  { header: 'End', get: (t) => t.endTime },
  { header: 'Duration (min)', get: (t) => t.duration },
  { header: 'Project', get: (t) => t.project },
  { header: 'Task', get: (t) => t.task?.name },
  { header: 'Customer', get: (t) => customerLabel(t.customer) },
  { header: 'Hourly Rate', get: (t) => t.hourlyRate },
  { header: 'Amount', get: (t) => t.amount },
  { header: 'Billable', get: (t) => (t.billable ? 'Yes' : 'No') },
  { header: 'Status', get: (t) => t.status },
  { header: 'Description', get: (t) => t.description },
];
export const useTimeEntryListMenu = (rows: Row[], onRefresh: () => unknown) =>
  useListMenu({ rows, sortFields: timeSort, exportColumns: timeExport, filename: 'time-entries', onRefresh });
