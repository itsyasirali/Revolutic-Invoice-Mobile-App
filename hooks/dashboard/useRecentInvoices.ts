import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';

export interface InvoiceDisplayItem {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
  badgeBg: string;
  badgeText: string;
  raw?: any;
}

const getStatusStyle = (status: string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'paid':
      return { badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-600' };
    case 'overdue':
      return { badgeBg: 'bg-rose-50', badgeText: 'text-rose-600' };
    case 'sent':
      return { badgeBg: 'bg-sky-50', badgeText: 'text-sky-600' };
    case 'partially paid':
      return { badgeBg: 'bg-amber-50', badgeText: 'text-amber-600' };
    default:
      return { badgeBg: 'bg-slate-100', badgeText: 'text-slate-600' };
  }
};

const useRecentInvoices = (overrides?: {
  invoices?: InvoiceDisplayItem[];
  loading?: boolean;
}) => {
  const { allInvoices = [], loading: invoiceLoading } = useInvoiceList();

  const loading = overrides?.loading ?? invoiceLoading;

  const invoices: InvoiceDisplayItem[] = useMemo(() => {
    if (overrides?.invoices && overrides.invoices.length > 0) {
      return overrides.invoices;
    }

    if (!allInvoices || allInvoices.length === 0) {
      return [];
    }

    const sorted = [...allInvoices].sort((a, b) => {
      const dateA = new Date(a.date || a.raw?.invoiceDate || a.raw?.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.raw?.invoiceDate || b.raw?.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return sorted.slice(0, 5).map((inv) => {
      const status = inv.status || 'Draft';
      const style = getStatusStyle(status);
      const dateVal = inv.date || inv.raw?.invoiceDate || inv.raw?.createdAt;
      const formattedDate = dateVal
        ? new Date(dateVal).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent';

      return {
        id: inv.id || inv.invoiceNumber,
        invoiceNumber: inv.invoiceNumber ? `#${inv.invoiceNumber}` : '#INV',
        customer: inv.customerName || 'Unknown Customer',
        amount: `PKR ${Number(inv.amount || 0).toLocaleString('en-US')}`,
        status,
        date: formattedDate,
        badgeBg: style.badgeBg,
        badgeText: style.badgeText,
        raw: inv.raw || inv,
      };
    });
  }, [allInvoices, overrides?.invoices]);


  const router = useRouter();

  const handleInvoicePress = (inv: InvoiceDisplayItem) => {
    const rawData = inv.raw || inv;
    const templateData =
      rawData?.templateId && typeof rawData.templateId === "object"
        ? rawData.templateId
        : null;

    router.push({
      pathname: "/screens/Invoice/detail",
      params: {
        invoiceData: JSON.stringify(rawData),
        id: inv.id,
        template: templateData ? JSON.stringify(templateData) : undefined,
      },
    });
  };

  const handleViewAll = () => {
    router.push("/screens/Invoice/invoices" as any);
  };

  return {
    invoices,
    loading,
    handleInvoicePress,
    handleViewAll,
  };
};

export default useRecentInvoices;
