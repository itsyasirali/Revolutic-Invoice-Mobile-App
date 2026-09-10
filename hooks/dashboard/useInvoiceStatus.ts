import { useMemo } from 'react';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';

export interface InvoiceStatusMetrics {
  paidPercent: number;
  paidCount: number;
  pendingPercent: number;
  pendingCount: number;
  overduePercent: number;
  overdueCount: number;
  totalCount: number;
}

const useInvoiceStatus = (overrides?: Partial<InvoiceStatusMetrics>): InvoiceStatusMetrics => {
  const { allInvoices = [] } = useInvoiceList();

  const metrics = useMemo(() => {
    if (overrides?.paidPercent !== undefined && overrides?.paidCount !== undefined) {
      const paid = overrides.paidCount ?? 0;
      const pending = overrides.pendingCount ?? 0;
      const overdue = overrides.overdueCount ?? 0;
      return {
        paidPercent: overrides.paidPercent ?? 0,
        paidCount: paid,
        pendingPercent: overrides.pendingPercent ?? 0,
        pendingCount: pending,
        overduePercent: overrides.overduePercent ?? 0,
        overdueCount: overdue,
        totalCount: paid + pending + overdue,
      };
    }

    if (!allInvoices || allInvoices.length === 0) {
      return {
        paidPercent: 0,
        paidCount: 0,
        pendingPercent: 0,
        pendingCount: 0,
        overduePercent: 0,
        overdueCount: 0,
        totalCount: 0,
      };
    }

    const total = allInvoices.length;
    const paid = allInvoices.filter((i) => (i.status || '').toLowerCase() === 'paid').length;
    const overdue = allInvoices.filter((i) => (i.status || '').toLowerCase() === 'overdue').length;
    const pending = Math.max(0, total - paid - overdue);

    const paidPct = Math.round((paid / total) * 100);
    const pendingPct = Math.round((pending / total) * 100);
    const overduePct = Math.max(0, 100 - paidPct - pendingPct);

    return {
      paidPercent: paidPct,
      paidCount: paid,
      pendingPercent: pendingPct,
      pendingCount: pending,
      overduePercent: overduePct,
      overdueCount: overdue,
      totalCount: total,
    };
  }, [allInvoices, overrides]);

  return metrics;
};

export default useInvoiceStatus;
