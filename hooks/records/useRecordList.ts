import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from '@/services/api';

interface Options<T> {
  url: string;
  listKey: string;
  searchText: (item: T) => string;
  matchFilter?: (item: T, filter: string) => boolean;
}

// Per-url in-memory cache so revisiting a list never flashes a loader.
const cache = new Map<string, any[]>();

/** Generic list loader: fetch, pull-to-refresh, search and status filter. */
export function useRecordList<T extends { id: number | string }>({ url, listKey, searchText, matchFilter }: Options<T>) {
  const [items, setItems] = useState<T[]>((cache.get(url) as T[]) ?? []);
  const [loading, setLoading] = useState(!cache.has(url));
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const res = await axios.get(url);
        const raw = res.data?.[listKey] ?? res.data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        cache.set(url, list);
        setItems(list);
      } catch (e) {
        console.error(`Failed to load ${url}`, e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [url, listKey]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== 'all' && matchFilter && !matchFilter(it, filter)) return false;
      return !q || searchText(it).toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, filter]);

  return {
    items,
    visible,
    loading,
    refreshing,
    search,
    setSearch,
    filter,
    setFilter,
    reload: () => load(false),
    refresh: () => load(true),
  };
}
