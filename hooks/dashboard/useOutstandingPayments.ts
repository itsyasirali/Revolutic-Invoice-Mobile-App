import { useMemo } from 'react';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { useReceivables } from '@/hooks/invoices/useReceivables';

export interface AgingItem {
  id: string;
  label: string;
  count: number;
  amount: string;
  dotColor: string;
}

const DEFAULT_AGING_EMPTY: AgingItem[] = [
  { id: '1', label: 'Due today', count: 0, amount: 'PKR 0', dotColor: '#ef4444' },
  { id: '2', label: '1–7 days', count: 0, amount: 'PKR 0', dotColor: '#f97316' },
  { id: '3', label: '8–30 days', count: 0, amount: 'PKR 0', dotColor: '#0284c7' },
  { id: '4', label: '30+ days', count: 0, amount: 'PKR 0', dotColor: '#94a3b8' },
];

const useOutstandingPayments = (overrides?: {
  totalAmount?: string;
  agingData?: AgingItem[];
}) => {
  const { allInvoices = [] } = useInvoiceList();
  const { totalReceivables = 0 } = useReceivables();

  const totalAmount = useMemo(() => {
    if (overrides?.totalAmount !== undefined) return overrides.totalAmount;
    return `PKR ${(totalReceivables || 0).toLocaleString('en-US')}`;
  }, [totalReceivables, overrides?.totalAmount]);

  const agingData = useMemo(() => {
    if (overrides?.agingData && overrides.agingData.length > 0) {
      return overrides.agingData;
    }

    const buckets = [
      { id: '1', label: 'Due today', count: 0, amount: 0, dotColor: '#ef4444' },
      { id: '2', label: '1–7 days', count: 0, amount: 0, dotColor: '#f97316' },
      { id: '3', label: '8–30 days', count: 0, amount: 0, dotColor: '#0284c7' },
      { id: '4', label: '30+ days', count: 0, amount: 0, dotColor: '#94a3b8' },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allInvoices.forEach((inv) => {
      const status = (inv.status || '').toLowerCase();
      if (status === 'paid' || status === 'cancelled') return;

      const fullAmount = Number(inv.amount || 0);
      const paidAmount = Number(inv.raw?.paidAmount || inv.raw?.received || 0);
      const remaining = Math.max(0, fullAmount - paidAmount);
      if (remaining <= 0) return;

      const dueDateStr = inv.dueDate || inv.date || inv.raw?.dueDate || inv.raw?.invoiceDate;
      const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();
      dueDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        buckets[0].count += 1;
        buckets[0].amount += remaining;
      } else if (diffDays >= 1 && diffDays <= 7) {
        buckets[1].count += 1;
        buckets[1].amount += remaining;
      } else if (diffDays >= 8 && diffDays <= 30) {
        buckets[2].count += 1;
        buckets[2].amount += remaining;
      } else {
        buckets[3].count += 1;
        buckets[3].amount += remaining;
      }
    });

    return buckets.map((b) => ({
      ...b,
      amount: `PKR ${b.amount.toLocaleString('en-US')}`,
    }));
  }, [allInvoices, overrides?.agingData]);

  return {
    totalAmount,
    agingData: agingData.length > 0 ? agingData : DEFAULT_AGING_EMPTY,
  };
};

export default useOutstandingPayments;
