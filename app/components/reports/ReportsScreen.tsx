import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from '@/services/api';
import { useSidebar } from '@/context/SidebarContext';
import MonthChart from './MonthChart';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'sales', label: 'Sales' },
  { key: 'receivables', label: 'Receivables' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'time', label: 'Time' },
];

const RANGES = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-quarter', label: 'This Quarter' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-12-months', label: 'Last 12 Months' },
  { value: 'all-time', label: 'All Time' },
];

const BLUE = '#1AA3FF';
const RED = '#ef4444';
const GREEN = '#10b981';
const AMBER = '#f59e0b';

/* ───────────── building blocks ───────────── */

const Section: React.FC<{ title: string; hint?: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  hint,
  right,
  children,
}) => (
  <View className="bg-white rounded-md border border-slate-100 shadow-sm p-4 mb-4">
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 pr-2">
        <Text className="text-base font-bold text-slate-800">{title}</Text>
        {!!hint && <Text className="text-xs text-slate-400 mt-0.5">{hint}</Text>}
      </View>
      {right}
    </View>
    {children}
  </View>
);

const Kpi: React.FC<{
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  caption?: string;
}> = ({ label, value, icon, color, caption }) => (
  <View className="flex-1 bg-white rounded-md border border-slate-100 shadow-sm p-4">
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-1" numberOfLines={1}>
        {label}
      </Text>
      <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
    </View>
    <Text className="text-xl font-bold text-slate-900" numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    {!!caption && <Text className="text-[11px] text-slate-400 mt-1">{caption}</Text>}
  </View>
);

const Empty: React.FC<{ icon?: keyof typeof Ionicons.glyphMap; text: string }> = ({ icon = 'file-tray-outline', text }) => (
  <View className="items-center py-6">
    <Ionicons name={icon} size={30} color="#cbd5e1" />
    <Text className="text-slate-400 mt-2 text-sm">{text}</Text>
  </View>
);

const ProgressBar: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <View className="h-2 rounded-full bg-slate-100 overflow-hidden">
    <View className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }} />
  </View>
);

const ListRow: React.FC<{
  rank?: number;
  title: string;
  sub?: string;
  value: string;
  valueColor?: string;
  last?: boolean;
  children?: React.ReactNode;
}> = ({ rank, title, sub, value, valueColor = '#0f172a', last, children }) => (
  <View className={`py-3 ${last ? '' : 'border-b border-slate-100'}`}>
    <View className="flex-row items-center">
      {rank !== undefined && (
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Text className="text-xs font-bold text-primary">{rank}</Text>
        </View>
      )}
      <View className="flex-1 pr-3">
        <Text className="text-slate-800 font-semibold" numberOfLines={1}>
          {title}
        </Text>
        {!!sub && (
          <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
      <Text className="font-bold" style={{ color: valueColor }}>
        {value}
      </Text>
    </View>
    {children && <View className="mt-2">{children}</View>}
  </View>
);

/* ───────────── screen ───────────── */

const ReportsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { openSidebar } = useSidebar();
  const [range, setRange] = useState('this-year');
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await axios.get('/api/reports', { params: { range } });
        setData(res.data?.data ?? null);
      } catch (e) {
        console.error('Failed to load reports', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const cur: string = data?.currency || '';
  const money = (n: number) => `${cur} ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`.trim();
  const s = data?.summary;
  const rangeLabel = RANGES.find((r) => r.value === range)?.label ?? '';
  const collectionRate = s && s.invoiced > 0 ? Math.round((s.received / s.invoiced) * 100) : 0;
  const maxAging = Math.max(1, ...(data?.aging ?? []).map((b: any) => b.amount));
  const totalExpenses = Math.max(1, ...[data?.expenseCategories?.reduce((a: number, c: any) => a + c.amount, 0) ?? 0]);
  const maxCustomer = Math.max(1, ...(data?.customers ?? []).map((c: any) => c.invoiced));
  const billablePct =
    data?.time?.totalHours > 0 ? Math.round((data.time.billableHours / data.time.totalHours) * 100) : 0;
  const profitPositive = (s?.netProfit ?? 0) >= 0;

  return (
    <View className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="px-4 pb-2 bg-slate-100" style={{ paddingTop: insets.top + 3 }}>
        <View className="flex-row items-center h-12">
          <Pressable
            onPress={openSidebar}
            className="mr-2.5 p-1.5 -ml-1.5 rounded-full active:bg-slate-200"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="menu" size={24} color="#1e293b" />
          </Pressable>
          <Text className="text-2xl font-bold text-slate-800 flex-1">Reports</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center bg-white border border-slate-200 rounded-md px-3 py-2 active:bg-slate-50"
          >
            <Ionicons name="calendar-outline" size={16} color={BLUE} />
            <Text className="text-sm font-semibold text-slate-700 mx-2">{rangeLabel}</Text>
            <Ionicons name="chevron-down" size={14} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      {/* Tabs (same look as the list filter tabs) */}
      <View className="bg-slate-100 border-b border-gray-100 w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className={`px-5 py-2.5 mr-2 rounded-md border ${active ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      ) : !data ? (
        <Empty icon="cloud-offline-outline" text="Could not load reports. Pull down to retry." />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={BLUE} colors={[BLUE]} />}
        >
          {tab === 'overview' && (
            <>
              <View className="rounded-md p-5 mb-4" style={{ backgroundColor: profitPositive ? '#0f766e' : '#b91c1c' }}>
                <Text className="text-white/80 text-xs font-semibold uppercase tracking-wide">Net Profit</Text>
                <Text className="text-white text-3xl font-extrabold mt-1" numberOfLines={1} adjustsFontSizeToFit>
                  {money(s.netProfit)}
                </Text>
                <Text className="text-white/70 text-xs mt-1">Received minus expenses • {data.rangeLabel}</Text>
              </View>
              <View className="flex-row gap-3 mb-3">
                <Kpi label="Invoiced" value={money(s.invoiced)} icon="receipt-outline" color={BLUE} />
                <Kpi label="Received" value={money(s.received)} icon="arrow-down-circle-outline" color={GREEN} />
              </View>
              <View className="flex-row gap-3 mb-4">
                <Kpi label="Expenses" value={money(s.expenses)} icon="wallet-outline" color={RED} />
                <Kpi label="Outstanding" value={money(s.outstanding)} icon="time-outline" color={AMBER} />
              </View>
              <Section title="Income vs Expenses" hint="Payments received against expenses, by month">
                <MonthChart
                  months={data.months}
                  currency={cur}
                  bars={[
                    { key: 'income', name: 'Income', color: '#3B82F6' },
                    { key: 'expenses', name: 'Expenses', color: '#EF4444' },
                  ]}
                />
              </Section>
            </>
          )}

          {tab === 'sales' && (
            <>
              <View className="flex-row gap-3 mb-3">
                <Kpi label="Invoiced" value={money(s.invoiced)} icon="receipt-outline" color={BLUE} />
                <Kpi label="Invoices" value={String(s.invoiceCount)} icon="documents-outline" color="#6366f1" />
              </View>
              <View className="flex-row gap-3 mb-4">
                <Kpi label="Fully Paid" value={String(s.paidCount)} icon="checkmark-circle-outline" color={GREEN} />
                <Kpi label="Collection" value={`${collectionRate}%`} icon="trending-up-outline" color={AMBER} />
              </View>
              <Section title="Invoiced by Month" hint="Excludes draft and cancelled invoices">
                <MonthChart months={data.months} currency={cur} bars={[{ key: 'invoiced', name: 'Invoiced', color: '#3B82F6' }]} />
              </Section>
              <Section title="Top Customers" hint="Ranked by amount invoiced">
                {data.customers.length === 0 ? (
                  <Empty text="No invoices in this period." />
                ) : (
                  data.customers.map((c: any, i: number) => (
                    <ListRow
                      key={c.name}
                      rank={i + 1}
                      title={c.name}
                      sub={`${c.invoices} invoices • received ${money(c.received)}`}
                      value={money(c.invoiced)}
                      last={i === data.customers.length - 1}
                    >
                      <ProgressBar pct={(c.invoiced / maxCustomer) * 100} color={BLUE} />
                    </ListRow>
                  ))
                )}
              </Section>
            </>
          )}

          {tab === 'receivables' && (
            <>
              <View className="flex-row gap-3 mb-4">
                <Kpi label="Outstanding" value={money(s.outstanding)} icon="time-outline" color={AMBER} />
                <Kpi label="Overdue" value={money(s.overdue)} icon="alert-circle-outline" color={RED} />
              </View>
              <Section title="Receivables Aging" hint="Unpaid balances by how late they are">
                {data.aging.map((b: any) => (
                  <View key={b.label} className="mb-3">
                    <View className="flex-row justify-between mb-1.5">
                      <Text className="text-slate-600 text-sm">{b.label}</Text>
                      <Text className="text-slate-800 text-sm font-semibold">
                        {money(b.amount)} <Text className="text-xs font-normal text-slate-400">({b.count})</Text>
                      </Text>
                    </View>
                    <ProgressBar pct={(b.amount / maxAging) * 100} color={b.label === 'Not yet due' ? BLUE : AMBER} />
                  </View>
                ))}
              </Section>
              <Section title="Most Overdue Invoices">
                {data.overdueInvoices.length === 0 ? (
                  <Empty icon="checkmark-done-outline" text="Nothing is overdue." />
                ) : (
                  data.overdueInvoices.map((i: any, idx: number) => (
                    <ListRow
                      key={i.id}
                      title={`${i.invoiceNumber} • ${i.customerName}`}
                      sub={`Due ${String(i.dueDate).slice(0, 10)} • ${i.daysOverdue} days overdue`}
                      value={money(i.amount)}
                      valueColor="#dc2626"
                      last={idx === data.overdueInvoices.length - 1}
                    />
                  ))
                )}
              </Section>
            </>
          )}

          {tab === 'expenses' && (
            <>
              <View className="flex-row gap-3 mb-4">
                <Kpi label="Total Expenses" value={money(s.expenses)} icon="wallet-outline" color={RED} />
                <Kpi label="Categories" value={String(data.expenseCategories.length)} icon="pricetags-outline" color="#6366f1" />
              </View>
              <Section title="By Category" hint="Share of total expenses">
                {data.expenseCategories.length === 0 ? (
                  <Empty text="No expenses in this period." />
                ) : (
                  data.expenseCategories.map((c: any, i: number) => (
                    <ListRow
                      key={c.name}
                      title={c.name}
                      sub={`${c.count} expenses • ${Math.round((c.amount / totalExpenses) * 100)}%`}
                      value={money(c.amount)}
                      last={i === data.expenseCategories.length - 1}
                    >
                      <ProgressBar pct={(c.amount / totalExpenses) * 100} color={RED} />
                    </ListRow>
                  ))
                )}
              </Section>
            </>
          )}

          {tab === 'time' && (
            <>
              <View className="flex-row gap-3 mb-3">
                <Kpi label="Total Hours" value={Number(data.time.totalHours).toFixed(1)} icon="timer-outline" color={BLUE} />
                <Kpi label="Billable" value={Number(data.time.billableHours).toFixed(1)} icon="cash-outline" color={GREEN} caption={`${billablePct}% of total`} />
              </View>
              <View className="flex-row gap-3 mb-4">
                <Kpi label="Unbilled Amount" value={money(data.time.unbilledAmount)} icon="hourglass-outline" color={AMBER} />
              </View>
              <Section title="By Project" hint="Hours logged and billable value">
                {data.time.byProject.length === 0 ? (
                  <Empty text="No time logged in this period." />
                ) : (
                  data.time.byProject.map((p: any, i: number) => (
                    <ListRow
                      key={p.name}
                      title={p.name}
                      sub={`${Number(p.hours).toFixed(1)} h • ${Number(p.billableHours).toFixed(1)} h billable`}
                      value={money(p.amount)}
                      last={i === data.time.byProject.length - 1}
                    />
                  ))
                )}
              </Section>
            </>
          )}
        </ScrollView>
      )}

      {/* Period picker */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable className="flex-1 bg-black/30" onPress={() => setPickerOpen(false)}>
          <View
            className="absolute right-4 bg-white rounded-md shadow-xl border border-slate-100 py-1 min-w-[220px]"
            style={{ top: insets.top + 56 }}
          >
            {RANGES.map((r, i) => {
              const active = r.value === range;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => {
                    setRange(r.value);
                    setPickerOpen(false);
                  }}
                  className={`flex-row items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-slate-50' : ''}`}
                >
                  <Text className={`text-base ${active ? 'font-bold text-primary' : 'text-slate-700'}`}>{r.label}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={BLUE} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ReportsScreen;
