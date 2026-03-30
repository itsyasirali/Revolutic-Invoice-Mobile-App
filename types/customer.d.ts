// Contact interface
export interface Contact {
    firstName?: string;
    lastName?: string;
    email?: string;
    contact?: string;
}

// Payment Transaction interface (Simplified for Mobile)
export interface PaymentTransaction {
    id: string;
    paymentDate: string | Date;
    paymentNumber?: number;
    referenceNo?: string;
    paymentMode: 'Cash' | 'Bank Transfer' | 'Bank Remittance' | 'Cheque' | 'Other';
    amountReceived: number;
    bankCharges?: number;
    currency?: string;
}

export type CustomerType = 'Business' | 'Individual';

export interface Customer {
    id: string;
    userId?: string;
    customerType: CustomerType;
    salutation?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    displayName?: string;
    currency: string;
    email?: string;
    phone?: string;
    address?: string;
    remarks?: string;
    documents?: string[];
    status?: string;
    contacts?: Contact[];
    receivables?: number;
    unusedCredits?: number;
    payments?: PaymentTransaction[];
    invoices?: any[]; // Populated from backend
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
