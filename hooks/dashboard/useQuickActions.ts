import { useState } from 'react';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { usePaymentList } from '@/hooks/payments/usePaymentList';

export type QuickActionModalType = 'customer' | 'item' | 'invoice' | 'payment' | null;

interface QuickActionsOptions {
  onCreateInvoice?: () => void;
  onAddCustomer?: () => void;
  onAddItem?: () => void;
  onRecordPayment?: () => void;
}

const useQuickActions = (options?: QuickActionsOptions) => {
  const [activeModal, setActiveModal] = useState<QuickActionModalType>(null);
  const { refreshInvoices } = useInvoiceList();
  const { handleSaveSuccess, formLoading } = usePaymentList();

  const handleOpenCustomer = () => {
    if (options?.onAddCustomer) {
      options.onAddCustomer();
    } else {
      setActiveModal('customer');
    }
  };

  const handleOpenItem = () => {
    if (options?.onAddItem) {
      options.onAddItem();
    } else {
      setActiveModal('item');
    }
  };

  const handleOpenInvoice = () => {
    if (options?.onCreateInvoice) {
      options.onCreateInvoice();
    } else {
      setActiveModal('invoice');
    }
  };

  const handleOpenPayment = () => {
    if (options?.onRecordPayment) {
      options.onRecordPayment();
    } else {
      setActiveModal('payment');
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSavePayment = async () => {
    const res = await handleSaveSuccess();
    handleCloseModal();
    return res;
  };

  const handleInvoiceSuccess = () => {
    handleCloseModal();
    refreshInvoices();
  };

  return {
    activeModal,
    formLoading,
    handleOpenCustomer,
    handleOpenItem,
    handleOpenInvoice,
    handleOpenPayment,
    handleCloseModal,
    handleSavePayment,
    handleInvoiceSuccess,
  };
};

export default useQuickActions;
