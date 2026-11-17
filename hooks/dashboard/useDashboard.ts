import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { usePaymentList } from '@/hooks/payments/usePaymentList';
import { useDashboardCharts } from '@/hooks/dashboard/useDashboardCharts';

const useDashboard = () => {
  const { refreshing: invoiceRefreshing, refreshInvoices } = useInvoiceList();
  const { refreshing: paymentRefreshing, refreshPayments } = usePaymentList();

  const { refresh: refreshCharts } = useDashboardCharts();

  const isRefreshing = invoiceRefreshing || paymentRefreshing;

  const handleRefresh = async () => {
    await Promise.all([refreshInvoices(), refreshPayments(), refreshCharts()]);
  };

  return {
    isRefreshing,
    handleRefresh,
  };
};

export default useDashboard;
