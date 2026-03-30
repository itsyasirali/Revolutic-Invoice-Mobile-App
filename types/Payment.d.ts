import { FormEvent, Dispatch, SetStateAction } from 'react';

export interface Payment {
  id: string;
  userId?: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  amountReceived?: number;
  currency: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Check' | 'Other';
  paymentMode?: string;
  paymentDate: string;
  reference?: string;
  description?: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id: string;
    displayName?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface PaymentFormData {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  invoiceId?: string;
  amount: string;
  bankCharges?: string | number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  reference: string;
  description: string;
  status: string;
  templateId?: string;
  notes: string;
}

export interface UsePaymentDetailsReturn {
  payment: Payment | null;
  loading: boolean;
  error: string | null;
}

export interface InvoiceDetail {
  id: string;
  number: string;
  total: number;
  received: number;
  remaining: number;
  status: string;
  dueDate?: string;
  currency?: string;
}

export interface CustomerOption {
  id: string;
  displayName: string;
  email?: string;
  companyName?: string;
  currency?: string;
}

export interface CreatePaymentPayload {
  paymentDate: string;
  paymentNumber?: number;
  referenceNo?: string;
  customerId: string;
  customerDisplayName: string;
  customerEmail?: string;
  paymentMode: string;
  amountReceived: number;
  bankCharges?: number;
  tdsApplied?: boolean;
  currency: string;
  appliedInvoices?: {
    invoiceId: string;
    amount: number;
  }[];
  status?: string;
}

export interface UseCreatePaymentReturn {
  amountReceived: number | "";
  setAmountReceived: Dispatch<SetStateAction<number | "">>;
  bankCharges: number | "";
  setBankCharges: Dispatch<SetStateAction<number | "">>;
  paymentDate: string;
  setPaymentDate: Dispatch<SetStateAction<string>>;
  paymentNumber: number | "";
  setPaymentNumber: Dispatch<SetStateAction<number | "">>;
  paymentMode: "Cash" | "Bank Transfer" | "Bank Remittance" | "Cheque" | "Other";
  setPaymentMode: Dispatch<SetStateAction<"Cash" | "Bank Transfer" | "Bank Remittance" | "Cheque" | "Other">>;
  referenceNo: string;
  setReferenceNo: Dispatch<SetStateAction<string>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  isDropdownOpen: boolean;
  openDropdown: () => void;
  closeDropdown: () => void;
  filteredCustomers: CustomerOption[];
  customersLoading: boolean;
  handleCustomerSelect: (customer: CustomerOption) => void;
  selectedCustomer: CustomerOption | null;
  selectedCustomerId: string;
  appliedAmounts: Record<string, number>;
  handleAppliedAmountChange: (invoiceId: string, value: string) => void;
  handlePayInFull: (invoiceId: string, remaining: number) => void;
  handleClearApplied: () => void;
  payAllRemaining: boolean;
  handlePayAllRemainingToggle: () => void;
  unpaidInvoices: InvoiceDetail[];
  currency: string;
  totalApplied: number;
  amountInExcess: number;
  formatAmount: (value: number) => string;
  handleSubmit: (event?: FormEvent<HTMLFormElement>, saveMode?: 'draft' | 'paid' | 'send') => Promise<{ success: boolean; paymentId?: string; mode?: string; error?: string }>;
  creating: boolean;
  createError: string | null;
  handleCancel: () => void;
}
