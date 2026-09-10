import { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/auth/useProfile';
import { useInvoiceList } from '@/hooks/invoices/useInvoiceList';

export type PeriodType = 'week' | 'month' | 'year';

export interface PeriodSummary {
  amount: number;
  growth: string;
  comparison: string;
  labels: string[];
  points: number[];
}

const DEFAULT_PERIOD_DATA: Record<PeriodType, PeriodSummary> = {
  week: {
    amount: 0,
    growth: '0%',
    comparison: 'vs last week',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    points: [0, 0, 0, 0, 0, 0, 0],
  },
  month: {
    amount: 0,
    growth: '0%',
    comparison: 'vs last month',
    labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
    points: [0, 0, 0, 0, 0],
  },
  year: {
    amount: 0,
    growth: '0%',
    comparison: 'vs last year',
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    points: [0, 0, 0, 0],
  },
};

const useRevenueHero = (overrides?: {
  userName?: string;
  companyName?: string;
  periodData?: Record<PeriodType, PeriodSummary>;
  unreadCount?: number;
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useProfile();
  const { allInvoices = [] } = useInvoiceList();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');

  // User and Company identity
  const userName =
    overrides?.userName || user?.firstName || (user?.name ? user.name.split(' ')[0] : 'User');
  const companyName =
    overrides?.companyName || user?.companyName || (user?.name ? `${user.name}'s Business` : 'My Business');
  const unreadCount = overrides?.unreadCount ?? 0;

  // Real period data computed from DB invoices
  const periodData = useMemo(() => {
    if (overrides?.periodData) return overrides.periodData;

    const now = new Date();

    const getPaidAmount = (inv: any): number => {
      const status = (inv.status || '').toLowerCase();
      if (status === 'paid') return Number(inv.amount || inv.raw?.total || 0);
      const partial = Number(inv.raw?.paidAmount || inv.raw?.received || 0);
      return partial > 0 ? partial : 0;
    };

    // Week
    const weekDaysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekPoints = [0, 0, 0, 0, 0, 0, 0];
    let weekTotal = 0;
    let prevWeekTotal = 0;
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Month
    const monthLabels = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const monthPoints = [0, 0, 0, 0, 0];
    let monthTotal = 0;
    let prevMonthTotal = 0;
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 59);
    sixtyDaysAgo.setHours(0, 0, 0, 0);

    // Year
    const yearLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const yearPoints = [0, 0, 0, 0];
    let yearTotal = 0;
    let prevYearTotal = 0;
    const currentYear = now.getFullYear();

    allInvoices.forEach((inv) => {
      const paid = getPaidAmount(inv);
      if (paid <= 0) return;

      const dateVal = inv.date || inv.raw?.invoiceDate || inv.raw?.createdAt;
      const invDate = dateVal ? new Date(dateVal) : null;
      if (!invDate || isNaN(invDate.getTime())) return;

      if (invDate >= sevenDaysAgo && invDate <= now) {
        weekTotal += paid;
        const dayIdx = (invDate.getDay() + 6) % 7;
        weekPoints[dayIdx] += paid;
      } else if (invDate >= fourteenDaysAgo && invDate < sevenDaysAgo) {
        prevWeekTotal += paid;
      }

      if (invDate >= thirtyDaysAgo && invDate <= now) {
        monthTotal += paid;
        const diffDays = Math.max(0, Math.floor((now.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24)));
        const bucket = Math.min(4, Math.floor((29 - diffDays) / 6));
        monthPoints[bucket] += paid;
      } else if (invDate >= sixtyDaysAgo && invDate < thirtyDaysAgo) {
        prevMonthTotal += paid;
      }

      if (invDate.getFullYear() === currentYear) {
        yearTotal += paid;
        const quarter = Math.min(3, Math.floor(invDate.getMonth() / 3));
        yearPoints[quarter] += paid;
      } else if (invDate.getFullYear() === currentYear - 1) {
        prevYearTotal += paid;
      }
    });

    const calcGrowth = (curr: number, prev: number): string => {
      if (prev <= 0 && curr <= 0) return '0%';
      if (prev <= 0 && curr > 0) return '+100%';
      const pct = Math.round(((curr - prev) / prev) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    return {
      week: {
        amount: weekTotal,
        growth: calcGrowth(weekTotal, prevWeekTotal),
        comparison: 'vs last week',
        labels: weekDaysLabels,
        points: weekPoints,
      },
      month: {
        amount: monthTotal,
        growth: calcGrowth(monthTotal, prevMonthTotal),
        comparison: 'vs last month',
        labels: monthLabels,
        points: monthPoints,
      },
      year: {
        amount: yearTotal,
        growth: calcGrowth(yearTotal, prevYearTotal),
        comparison: 'vs last year',
        labels: yearLabels,
        points: yearPoints,
      },
    };
  }, [allInvoices, overrides?.periodData]);

  const current = periodData[selectedPeriod] || DEFAULT_PERIOD_DATA[selectedPeriod];

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const rawPoints = current.points && current.points.length > 0 ? current.points : [0, 0, 0, 0, 0];
    const n = rawPoints.length;
    const width = 300;
    const startX = 15;
    const endX = startX + width;
    const stepX = width / Math.max(1, n - 1);

    const maxVal = Math.max(...rawPoints);
    const minHeightY = 70;
    const maxHeightY = 16;

    const coords = rawPoints.map((val, idx) => {
      const cx = Math.round(startX + idx * stepX);
      const ratio = maxVal > 0 ? val / maxVal : 0;
      const cy = Math.round(minHeightY - ratio * (minHeightY - maxHeightY));
      return { cx, cy, val };
    });

    let peak = coords[0];
    for (const pt of coords) {
      if (pt.val > peak.val) peak = pt;
    }

    let curvePath = `M ${coords[0].cx} ${coords[0].cy}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cp1x = Math.round(p0.cx + (p1.cx - p0.cx) / 2);
      const cp1y = p0.cy;
      const cp2x = Math.round(p0.cx + (p1.cx - p0.cx) / 2);
      const cp2y = p1.cy;
      curvePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.cx} ${p1.cy}`;
    }

    const areaPath = `${curvePath} L ${endX} 85 L ${startX} 85 Z`;

    return { coords, peak, curvePath, areaPath, hasData: maxVal > 0 };
  }, [current.points]);

  const formattedAmount = `PKR ${current.amount.toLocaleString('en-US')}`;
  const isPositive = current.growth.startsWith('+');

  return {
    insets,
    userName,
    companyName,
    unreadCount,
    selectedPeriod,
    setSelectedPeriod,
    current,
    chartGeometry,
    formattedAmount,
    isPositive,
  };
};

export default useRevenueHero;
