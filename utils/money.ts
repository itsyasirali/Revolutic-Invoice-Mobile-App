export const formatMoney = (value: unknown, currency?: string | null) => {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  const text = safe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${text}` : text;
};

export const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
};

/** Minutes -> "2h 05m". */
export const formatDuration = (minutes?: number | null) => {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};
