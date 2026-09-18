import { useEffect, useState, useMemo } from "react";
import { useOrganization } from "@/context/OrganizationContext";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  PKR: "₨",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "﷼",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
  CNY: "¥",
  JPY: "¥",
  SGD: "S$",
  TRY: "₺",
  ZAR: "R",
  NGN: "₦",
  BDT: "৳",
  CHF: "CHF",
};

export const getCurrencySymbol = (code?: string): string => {
  if (!code) return "₨";
  const upper = code.trim().toUpperCase();
  return CURRENCY_SYMBOLS[upper] || upper;
};

export const useOrgCurrency = () => {
  const { organization } = useOrganization();
  const orgCurrency = (organization?.currency || "PKR").toUpperCase().trim();
  const currencySymbol = getCurrencySymbol(orgCurrency);

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${orgCurrency}`
        );
        const data = await res.json();
        if (isMounted && data?.rates) {
          setExchangeRates(data.rates);
        }
      } catch {
        // Fallback rates referenced to USD
        const usdRates: Record<string, number> = {
          USD: 1,
          PKR: 278,
          EUR: 0.92,
          GBP: 0.79,
          CAD: 1.36,
          AUD: 1.52,
          INR: 83.5,
          AED: 3.67,
          SAR: 3.75,
          JPY: 155,
          CNY: 7.23,
          CHF: 0.91,
          SGD: 1.35,
        };
        const baseInUsd = usdRates[orgCurrency] || 1;
        const rates: Record<string, number> = {};
        Object.keys(usdRates).forEach((cur) => {
          rates[cur] = usdRates[cur] / baseInUsd;
        });
        rates[orgCurrency] = 1;
        if (isMounted) setExchangeRates(rates);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRates();
    return () => {
      isMounted = false;
    };
  }, [orgCurrency]);

  const convertToOrgCurrency = useMemo(() => {
    return (amount: number, sourceCurrency?: string) => {
      const src = (sourceCurrency || orgCurrency).toUpperCase().trim();
      const tgt = orgCurrency;
      if (src === tgt) return amount;
      const rate = exchangeRates[src];
      if (!rate || rate <= 0) return amount;
      return amount / rate;
    };
  }, [orgCurrency, exchangeRates]);

  // Backward compatibility alias for existing usages
  const convertToPKR = useMemo(() => {
    return (amount: number, currency?: string) => {
      return convertToOrgCurrency(amount, currency);
    };
  }, [convertToOrgCurrency]);

  return {
    orgCurrency,
    currencySymbol,
    exchangeRates,
    convertToOrgCurrency,
    convertToPKR,
    loading,
  };
};

export const usePKRCurrency = useOrgCurrency;
export default useOrgCurrency;
