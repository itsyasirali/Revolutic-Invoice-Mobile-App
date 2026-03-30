export interface InvoiceItem {
  id?: number; // UI only
  itemId?: string;
  title: string;
  name?: string; // Payload alias for title if needed, or UI display
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  unit?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface InvoiceCustomer {
  id: string;
  displayName?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  receivables?: number;
  currency?: string;
  contacts?: Array<{
    firstName?: string;
    lastName?: string;
    email?: string;
    contact?: string;
  }>;
}

export interface InvoiceItemData {
  id: string;
  name: string;
  unit?: string;
  sellingPrice?: number;
  description?: string;
  status?: string;
}

export interface Invoice {
  id: string;
  userId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string | InvoiceCustomer;
  customerDisplayName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subTotal: number;
  total: number;
  // discountPercent removed as per DB schema, but now re-added
  discountPercent?: number;
  received?: number;
  remaining?: number;
  previousRemaining?: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partially Paid';
  notes?: string;
  templateId?: string;
  recipients?: string[];
  sentAt?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  items: InvoiceItem[];
  currency: string;
  notes: string;
  subTotal: number;
  total: number;
  templateId?: string;
  recipients?: string[];
  discountPercent?: number;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  attachments?: string[];
}

export interface UIInvoiceListItem {
  id: string; // Internal or mapped ID
  id: string; // Database ID
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: string;
  raw: any; // Keep raw for now to pass to details if needed
}

export interface InvoiceFormProps {
  initialData?: any;
  onCancel: () => void;
  onSaveSuccess?: (invoice?: any) => void;
}
