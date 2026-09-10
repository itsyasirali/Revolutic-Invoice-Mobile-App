import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { usePaymentList } from '@/hooks/payments/usePaymentList';

const useDashboard = () => {
  const { refreshing: invoiceRefreshing, refreshInvoices } = useInvoiceList();
  const { refreshing: paymentRefreshing, refreshPayments } = usePaymentList();

  const isRefreshing = invoiceRefreshing || paymentRefreshing;

  const handleRefresh = async () => {
    await Promise.all([refreshInvoices(), refreshPayments()]);
  };

  return {
    isRefreshing,
    handleRefresh,
  };
};

export default useDashboard;
