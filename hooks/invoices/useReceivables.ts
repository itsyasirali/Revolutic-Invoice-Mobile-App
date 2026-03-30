import { useMemo, useState } from "react";
import { useInvoiceList } from "./useInvoiceList";
import { usePKRCurrency } from "../common/useCurrencyExchange";
import { startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, subQuarters, startOfYear, endOfYear, subYears, isWithinInterval, format } from "date-fns";

export type FilterType =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_fiscal_year"
  | "last_fiscal_year"
  | "last_12_months";

export const useReceivables = () => {
  const { allInvoices, loading: invoiceLoading } = useInvoiceList();
  const { convertToPKR, loading: ratesLoading } = usePKRCurrency();
  const [filter, setFilter] = useState<FilterType>("this_fiscal_year");

  const data = useMemo(() => {
    if (!allInvoices || allInvoices.length === 0) {
      return {
        totalSales: 0,
        totalReceipts: 0,
        totalReceivables: 0,
        graphData: [],
      };
    }

    const now = new Date();
    let startDate = subMonths(now, 11); // Default last 12 months
    let endDate = now;

    // Determine Date Range
    switch (filter) {
      case "this_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last_month":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "this_quarter":
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        break;
      case "last_quarter":
        startDate = startOfQuarter(subQuarters(now, 1));
        endDate = endOfQuarter(subQuarters(now, 1));
        break;
      case "this_fiscal_year": // Assuming Jan-Dec for simplification, can be adjusted
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case "last_fiscal_year":
        startDate = startOfYear(subYears(now, 1));
        endDate = endOfYear(subYears(now, 1));
        break;
      case "last_12_months":
      default:
        startDate = subMonths(now, 11);
        endDate = endOfMonth(now); // Ensure we cover up to now
        break;
    }

    let totalSales = 0;
    let totalReceipts = 0;
    let totalReceivables = 0;

    // Grouping Map
    // We strictly use `remaining` instead of `sales` for the primary bar as requested ("convert sales as reamanining")
    const historyMap = new Map<string, { label: string, remaining: number, receipts: number, sortKey: number }>();

    // Initialize keys based on range to ensure all months/days appear even if empty
    // For simple iteration, we'll iterate the calculated range month-by-month
    let iterDate = new Date(startDate);
    // Normalize to start of month for iteration safety
    iterDate.setDate(1);

    while (iterDate <= endDate) {
      const key = `${iterDate.getFullYear()}-${iterDate.getMonth()}`;
      const label = format(iterDate, "MMM");
      historyMap.set(key, { label, remaining: 0, receipts: 0, sortKey: iterDate.getTime() });
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    allInvoices.forEach((item) => {
      const inv = item.raw;
      const status = String(inv?.status ?? "").toLowerCase();
      const currency = inv?.currency || inv?.customerCurrency || "PKR";
      const invoiceDate = inv?.invoiceDate ? new Date(inv.invoiceDate) : new Date();

      // Filter by Date
      if (!isWithinInterval(invoiceDate, { start: startDate, end: endDate })) {
        return;
      }

      const total = Number(inv?.total || inv?.amount || 0);
      const paid = Number(inv?.paidAmount || inv?.received || 0);
      const remaining = Math.max(0, total - paid);

      const totalPKR = convertToPKR(total, currency);
      const paidPKR = convertToPKR(paid, currency);
      const remainingPKR = convertToPKR(remaining, currency);

      if (status !== 'draft' && status !== 'cancelled') {
        totalSales += totalPKR;
        totalReceipts += paidPKR;
        totalReceivables += remainingPKR;

        const key = `${invoiceDate.getFullYear()}-${invoiceDate.getMonth()}`;

        // Ensure entry exists for this key even if initialization missed it (safety net)
        if (!historyMap.has(key)) {
          const label = format(invoiceDate, "MMM");
          historyMap.set(key, { label, remaining: 0, receipts: 0, sortKey: invoiceDate.getTime() });
        }

        const entry = historyMap.get(key)!;
        entry.remaining += remainingPKR;
        entry.receipts += paidPKR;
      }
    });

    const graphData = Array.from(historyMap.values()).sort((a, b) => a.sortKey - b.sortKey);

    return {
      totalSales,
      totalReceipts,
      totalReceivables,
      graphData,
    };
  }, [allInvoices, convertToPKR, filter]);

  return {
    ...data,
    isLoading: invoiceLoading || ratesLoading,
    filter,
    setFilter,
  };
};
