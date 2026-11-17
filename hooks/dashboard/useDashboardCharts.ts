import useSWR, { mutate as globalMutate } from 'swr';
import axios from '@/services/api';

export interface RevenuePoint {
  month: string;
  income: number;
  expenses: number;
}

export interface SalesSegment {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardCharts {
  revenueOverview: RevenuePoint[];
  revenueOverviewWeekly: RevenuePoint[];
  salesOverview: {
    totalSales: number;
    currency: string;
    segments: { paid: SalesSegment; partial: SalesSegment; unpaid: SalesSegment };
  };
}

export const DASHBOARD_KEY = '/api/dashboard';

const fetchDashboard = async (): Promise<DashboardCharts> => {
  const res = await axios.get(DASHBOARD_KEY);
  return res.data?.data;
};

/** Chart data from the same service the web dashboard uses (one shared request). */
export const useDashboardCharts = () => {
  const { data, isLoading } = useSWR<DashboardCharts>(DASHBOARD_KEY, fetchDashboard, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    onError: (e) => console.error('Failed to load dashboard charts', e),
  });
  return { data, loading: isLoading && !data, refresh: () => globalMutate(DASHBOARD_KEY) };
};
