import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { exportCsv } from '@/utils/csv';
import type { ImportKind } from '@/hooks/import/useImport';
import { nextSort, sortRows, type SortField } from '@/utils/sortRows';

export type { SortField };

export interface ExportColumn<T> {
  header: string;
  get: (row: T) => unknown;
}

interface Options<T> {
  rows: T[];
  sortFields: SortField<T>[];
  exportColumns: ExportColumn<T>[];
  /** Base name of the exported file, e.g. "customers". */
  filename: string;
  importKind?: ImportKind;
  importLabel?: string;
  onRefresh: () => unknown;
}

/**
 * Shared "..." menu behaviour for list screens (same as the web): sorted rows
 * (client side), CSV export of what is shown, import and refresh.
 */
export function useListMenu<T>({ rows, sortFields, exportColumns, filename, importKind, importLabel, onRefresh }: Options<T>) {
  const [sort, setSort] = useState<{ value: string; dir: 'asc' | 'desc' } | null>(null);

  const sorted = useMemo(
    () => sortRows(rows, sortFields, sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, sort]
  );

  const handleExport = async () => {
    if (sorted.length === 0) return Alert.alert('Nothing to export', 'There are no records in this list.');
    const header = exportColumns.map((c) => c.header);
    const body = sorted.map((r) => exportColumns.map((c) => c.get(r) ?? ''));
    await exportCsv(`${filename}-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body]);
  };

  return {
    rows: sorted,
    menu: {
      sort: {
        options: sortFields.map(({ label, value }) => ({ label, value })),
        active: sort,
        // Choosing the same field again flips the direction.
        onChange: (value: string) => setSort((s) => nextSort(s, value)),
        onClear: () => setSort(null),
      },
      importKind,
      importLabel,
      onExport: handleExport,
      onRefresh,
    },
  };
}

export type ListMenuProps = ReturnType<typeof useListMenu>['menu'];
