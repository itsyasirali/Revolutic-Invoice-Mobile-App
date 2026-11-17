import { useEffect, useMemo, useState } from 'react';
import axios from '@/services/api';
import useCustomerList from '@/hooks/customers/useCustomerList';
import { useItemList } from '@/hooks/items/useItemList';
import type { DropdownOption } from '@/app/components/ui/SearchableDropdown';

const isActive = (status?: string) => !String(status || '').toLowerCase().includes('inactive');

/** Active customers as dropdown options (full list is returned for lookups). */
export const useCustomerOptions = () => {
  const { customers } = useCustomerList();
  const options: DropdownOption[] = useMemo(
    () =>
      customers
        .filter((c: any) => isActive(c.status))
        .map((c: any) => ({
          label: c.displayName || c.companyName || 'Unknown Customer',
          value: c.id,
          sublabel: [c.companyName, c.email].filter(Boolean).join(' • ') || undefined,
        })),
    [customers]
  );
  return { customers, options };
};

/** Active items as dropdown options. */
export const useItemOptions = () => {
  const { items } = useItemList();
  const options: DropdownOption[] = useMemo(
    () =>
      items
        .filter((i: any) => isActive(i.status))
        .map((i: any) => ({
          label: i.name || 'Unnamed Item',
          value: i.id,
          sublabel: i.sellingPrice ? `Price: ${i.sellingPrice} | Unit: ${i.unit || '-'}` : undefined,
        })),
    [items]
  );
  return { items, options };
};

/** Projects as dropdown options (for expenses). */
export const useProjectOptions = () => {
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    axios
      .get('/api/projects')
      .then((r) => setProjects(r.data?.projects ?? []))
      .catch(() => setProjects([]));
  }, []);
  const options: DropdownOption[] = useMemo(
    () =>
      projects.map((p) => ({
        label: p.name,
        value: p.id,
        sublabel: [p.projectNumber, p.customer?.displayName || p.customer?.companyName].filter(Boolean).join(' • ') || undefined,
      })),
    [projects]
  );
  return { projects, options };
};

/** Expense categories as dropdown options. */
export const useExpenseCategoryOptions = () => {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    axios
      .get('/api/expenses/categories')
      .then((r) => setCategories(r.data?.categories ?? []))
      .catch(() => setCategories([]));
  }, []);
  const options: DropdownOption[] = useMemo(() => categories.map((c) => ({ label: c.name, value: c.id })), [categories]);
  return { categories, options };
};
