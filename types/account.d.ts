export interface MyAccount {
  id: string;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  iban?: string;
  swiftNumber?: string;
  country?: string;
  status?: 'Active' | 'Inactive';
}