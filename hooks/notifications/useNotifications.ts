import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';
import { usePaymentList } from '@/hooks/payments/usePaymentList';
import { useOrganization } from '@/context/OrganizationContext';

export interface NotificationItem {
  id: string;
  kind: 'invoice' | 'payment';
  title: string;
  description: string;
  time: number;
  unread: boolean;
  /** The full record, passed to the details screen like the lists do. */
  raw: any;
}

export const NOTIFICATION_LIMIT = 30;

export const formatTimeAgo = (time: number) => {
  const mins = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(time).toLocaleDateString();
};

const storageKey = (orgId?: number | string) => `notifications_last_seen_${orgId ?? 'default'}`;

/**
 * Recent invoice and payment activity as notifications (same rules as the web
 * drawer). It reads the lists the invoice and payment screens already cache, so
 * it adds no requests of its own. "Unread" means newer than the last time the
 * notifications screen was opened, kept per organization on the device.
 */
const useNotifications = () => {
  const { organization } = useOrganization();
  const key = storageKey(organization?.id);
  const { allInvoices = [], loading: invLoading } = useInvoiceList();
  const { allPayments = [], loading: payLoading } = usePaymentList();

  const [lastSeen, setLastSeen] = useState<number | null>(null);
  // While the screen is open, unread rows stay highlighted even though the badge cleared.
  const [highlightAfter, setHighlightAfter] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(key)
      .then(async (raw) => {
        if (!alive) return;
        if (raw) {
          setLastSeen(Number(raw));
        } else {
          // First visit: start from now so existing history is not shown as unread.
          const now = Date.now();
          await AsyncStorage.setItem(key, String(now)).catch(() => {});
          setLastSeen(now);
        }
      })
      .catch(() => setLastSeen(Date.now()));
    setHighlightAfter(null);
    return () => {
      alive = false;
    };
  }, [key]);

  const all = useMemo(() => {
    const invoices = (allInvoices as any[]).map((inv) => {
      const raw = inv.raw || inv;
      const status = String(inv.status || raw.status || '').toLowerCase();
      const label = inv.invoiceNumber || raw.invoiceNumber || `INV-${inv.id}`;
      return {
        id: `invoice-${inv.id}-${status}`,
        kind: 'invoice' as const,
        title:
          status === 'paid'
            ? `Invoice ${label} paid`
            : status === 'draft'
              ? `Invoice ${label} saved as draft`
              : `Invoice ${label} ${status || 'created'}`,
        description: `${inv.customerName || 'Customer'} • ${inv.currency || ''} ${Number(inv.amount || 0).toLocaleString()}`.replace(/\s+/g, ' ').trim(),
        time: new Date(raw.updatedAt || raw.createdAt || 0).getTime(),
        raw,
      };
    });

    const payments = (allPayments as any[]).map((p) => ({
      id: `payment-${p.id}`,
      kind: 'payment' as const,
      title: `Payment #${p.paymentNumber || p.id} received`,
      description: `${p.customer?.displayName || p.customer?.companyName || p.customerDisplayName || 'Customer'} • ${p.currency || ''} ${Number(p.amountReceived ?? p.amount ?? 0).toLocaleString()}`.replace(/\s+/g, ' ').trim(),
      time: new Date(p.updatedAt || p.createdAt || 0).getTime(),
      raw: p,
    }));

    return [...invoices, ...payments].filter((n) => Number.isFinite(n.time) && n.time > 0).sort((a, b) => b.time - a.time);
  }, [allInvoices, allPayments]);

  const unreadCount = lastSeen ? all.filter((n) => n.time > lastSeen).length : 0;

  const items: NotificationItem[] = useMemo(() => {
    const boundary = highlightAfter ?? lastSeen ?? Infinity;
    return all.slice(0, NOTIFICATION_LIMIT).map((n) => ({ ...n, unread: n.time > boundary }));
  }, [all, highlightAfter, lastSeen]);

  /** Call when the screen opens: clears the badge but keeps rows highlighted. */
  const markAllRead = useCallback(() => {
    setHighlightAfter(lastSeen);
    const now = Date.now();
    setLastSeen(now);
    AsyncStorage.setItem(key, String(now)).catch(() => {});
  }, [key, lastSeen]);

  return { items, unreadCount, loading: (invLoading || payLoading) && all.length === 0, markAllRead };
};

export default useNotifications;
