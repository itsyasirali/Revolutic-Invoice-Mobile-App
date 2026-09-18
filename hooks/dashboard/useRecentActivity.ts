import { useMemo } from 'react';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { usePaymentList } from '@/hooks/payments/usePaymentList';
import { useOrgCurrency } from '@/hooks/common/useCurrencyExchange';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  time: string;
  type: 'received' | 'sent' | 'paid' | 'overdue';
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const useRecentActivity = (overrides?: { activities?: ActivityItem[] }) => {
  const { allInvoices = [] } = useInvoiceList();
  const { allPayments = [] } = usePaymentList();
  const { orgCurrency } = useOrgCurrency();

  const activities: ActivityItem[] = useMemo(() => {
    if (overrides?.activities && overrides.activities.length > 0) {
      return overrides.activities;
    }

    const combined: {
      id: string;
      title: string;
      subtitle: string;
      amount: string;
      date: Date;
      type: ActivityItem['type'];
    }[] = [];

    // Map Invoices
    allInvoices.forEach((inv) => {
      const s = (inv.status || '').toLowerCase();
      let type: ActivityItem['type'] = 'sent';
      if (s === 'paid') type = 'paid';
      else if (s === 'overdue') type = 'overdue';

      const dateVal = inv.date || inv.raw?.createdAt || inv.raw?.invoiceDate;
      const parsedDate = dateVal ? new Date(dateVal) : new Date();
      const invCur = inv.currency || inv.raw?.currency || orgCurrency;

      combined.push({
        id: `inv-${inv.id || inv.invoiceNumber}`,
        title: `Invoice #${inv.invoiceNumber || 'INV'}`,
        subtitle:
          s === 'paid'
            ? `Paid by ${inv.customerName || 'Customer'}`
            : s === 'overdue'
            ? `Overdue • ${inv.customerName || 'Customer'}`
            : `Sent to ${inv.customerName || 'Customer'}`,
        amount: `${invCur} ${Number(inv.amount || 0).toLocaleString('en-US')}`,
        date: parsedDate,
        type,
      });
    });

    // Map Payments
    allPayments.forEach((p) => {
      const dateVal = p.paymentDate || (p as any).createdAt;
      const parsedDate = dateVal ? new Date(dateVal) : new Date();
      const customerName =
        p.customer?.displayName || p.customer?.companyName || p.customer?.firstName || 'Customer';
      const payCur = p.currency || (p as any).raw?.currency || orgCurrency;

      combined.push({
        id: `pay-${p.id}`,
        title: 'Payment Received',
        subtitle: `From ${customerName}`,
        amount: `${payCur} ${Number(p.amount || 0).toLocaleString('en-US')}`,
        date: parsedDate,
        type: 'received',
      });
    });

    combined.sort((a, b) => b.date.getTime() - a.date.getTime());

    return combined.slice(0, 4).map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      amount: item.amount,
      time: formatRelativeTime(item.date),
      type: item.type,
    }));
  }, [allInvoices, allPayments, overrides?.activities, orgCurrency]);

  return { items: activities, activities };
};

export default useRecentActivity;
