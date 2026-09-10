import { useMemo } from 'react';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { usePaymentList } from '@/hooks/payments/usePaymentList';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  time: string;
  type: 'paid' | 'sent' | 'received' | 'overdue';
}

const formatRelativeTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return 'Recently';
  const target = new Date(dateInput).getTime();
  if (isNaN(target)) return 'Recently';
  const diffMs = Date.now() - target;
  if (diffMs < 0) return 'Just now';
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(target).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const useRecentActivity = (overrideItems?: ActivityItem[]) => {
  const { allInvoices = [] } = useInvoiceList();
  const { allPayments = [] } = usePaymentList();

  const items = useMemo(() => {
    if (overrideItems) return overrideItems;

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
      const s = (inv.status || 'Draft').toLowerCase();
      let type: ActivityItem['type'] = 'sent';
      if (s === 'paid') type = 'paid';
      else if (s === 'overdue') type = 'overdue';

      const dateVal = inv.date || inv.raw?.createdAt || inv.raw?.invoiceDate;
      const parsedDate = dateVal ? new Date(dateVal) : new Date();

      combined.push({
        id: `inv-${inv.id || inv.invoiceNumber}`,
        title: `Invoice #${inv.invoiceNumber || 'INV'}`,
        subtitle:
          s === 'paid'
            ? `Paid by ${inv.customerName || 'Customer'}`
            : s === 'overdue'
            ? `Overdue • ${inv.customerName || 'Customer'}`
            : `Sent to ${inv.customerName || 'Customer'}`,
        amount: `PKR ${Number(inv.amount || 0).toLocaleString('en-US')}`,
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

      combined.push({
        id: `pay-${p.id}`,
        title: 'Payment Received',
        subtitle: `From ${customerName}`,
        amount: `PKR ${Number(p.amount || 0).toLocaleString('en-US')}`,
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
  }, [allInvoices, allPayments, overrideItems]);

  return { items };
};

export default useRecentActivity;
