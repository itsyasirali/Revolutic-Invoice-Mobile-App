// Invoice status colors, mirrored from the web app's Badge component
// (components/ui/Badge.tsx) so both apps show the same colors.
export interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const STYLES = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: '#10b981' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: '#dc2626' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: '#f59e0b' },
  info: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: '#0ea5e9' },
  gray: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: '#64748b' },
  muted: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: '#8b5cf6' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: '#94a3b8' },
  primary: { bg: 'bg-blue-50', text: 'text-primary', border: 'border-blue-200', dot: '#3b82f6' },
} satisfies Record<string, StatusStyle>;

export const getInvoiceStatusStyle = (status?: string): StatusStyle => {
  const s = (status || '').toLowerCase().trim();
  // Projects, quotes and expenses (same map as the web statusVariants).
  if (s === 'on hold' || s === 'expired' || s === 'unbilled') return STYLES.warning;
  if (s === 'completed' || s === 'converted') return STYLES.muted;
  if (s === 'accepted' || s === 'invoiced') return STYLES.success;
  if (s === 'declined') return STYLES.danger;
  if (s === 'viewed') return STYLES.primary;
  if (s === 'non-billable') return STYLES.gray;
  if (s.includes('inactive') || s.includes('archived')) return STYLES.inactive;
  if (s.includes('active')) return STYLES.success;
  if (s.includes('written off')) return STYLES.muted;
  if (s.includes('partial')) return STYLES.warning;
  if (s.includes('paid') && !s.includes('unpaid')) return STYLES.success;
  if (s.includes('overdue') || s.includes('unpaid') || s.includes('failed')) return STYLES.danger;
  if (s.includes('sent')) return STYLES.info;
  if (s.includes('draft') || s.includes('pending') || s.includes('cancelled')) return STYLES.gray;
  return STYLES.primary;
};

// Same rules apply to every status badge (customers, items, ...), as on web.
export const getStatusStyle = getInvoiceStatusStyle;
