import { useState } from 'react';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { showToast } from '@/utils/toast';

export type ImportKind =
  | 'contacts'
  | 'items'
  | 'projects'
  | 'expenses'
  | 'quotes'
  | 'invoices'
  | 'payments';
export type RowStatus = 'new' | 'exists' | 'error';
export interface ImportIssue {
  entity: string;
  index: number;
  message: string;
}
type Row = Record<string, any>;

// Mirrors the web app's KIND_ENTITY mapping (lib/import/types.ts).
export const KIND_ENTITY: Record<ImportKind, string> = {
  contacts: 'customers',
  items: 'items',
  projects: 'projects',
  expenses: 'expenses',
  quotes: 'quotes',
  invoices: 'invoices',
  payments: 'payments',
};

export const IMPORT_KINDS: { kind: ImportKind; label: string; icon: string }[] = [
  { kind: 'contacts', label: 'Customers', icon: 'people-outline' },
  { kind: 'items', label: 'Items', icon: 'cube-outline' },
  { kind: 'projects', label: 'Projects', icon: 'briefcase-outline' },
  { kind: 'expenses', label: 'Expenses', icon: 'wallet-outline' },
  { kind: 'quotes', label: 'Quotes', icon: 'document-text-outline' },
  { kind: 'invoices', label: 'Invoices', icon: 'receipt-outline' },
  { kind: 'payments', label: 'Payments', icon: 'card-outline' },
];

const errorData = (err: any) => err?.response?.data as { message?: string; errors?: ImportIssue[] } | undefined;

const useImport = () => {
  const [kind, setKind] = useState<ImportKind>('contacts');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [statuses, setStatuses] = useState<RowStatus[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const entity = KIND_ENTITY[kind];

  const reset = () => {
    setRows([]);
    setStatuses([]);
    setIssues([]);
    setWarnings([]);
    setFileName('');
    setDone(null);
  };

  const selectKind = (k: ImportKind) => {
    setKind(k);
    reset();
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'application/vnd.ms-excel', 'text/plain'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];

    setLoading(true);
    setDone(null);
    try {
      const form = new FormData();
      form.append(kind, {
        uri: asset.uri,
        name: asset.name || `${kind}.csv`,
        type: asset.mimeType || 'text/csv',
      } as any);
      form.append('dryRun', 'true');
      const { data } = await axios.post('/api/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRows(data.drafts?.[entity] ?? []);
      setStatuses(data.statuses?.[entity] ?? []);
      setIssues(data.errors ?? []);
      setWarnings(data.warnings ?? []);
      setFileName(asset.name || '');
    } catch (err) {
      showToast('error', errorData(err)?.message || 'Could not read the file');
    } finally {
      setLoading(false);
    }
  };

  const removeRow = (i: number) => {
    setRows((p) => p.filter((_, idx) => idx !== i));
    setStatuses((p) => p.filter((_, idx) => idx !== i));
    setIssues((p) => p.filter((e) => e.index !== i).map((e) => (e.index > i ? { ...e, index: e.index - 1 } : e)));
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/import', { drafts: { [entity]: rows }, dryRun: false });
      const list: RowStatus[] = data.statuses?.[entity] ?? [];
      const created = list.filter((s) => s === 'new').length;
      const existed = list.filter((s) => s === 'exists').length;
      const msg = `${created} imported${existed ? `, ${existed} already existed` : ''}`;
      reset();
      setDone(msg);
      showToast('success', msg);
    } catch (err) {
      const data = errorData(err);
      if (data?.errors?.length) {
        setIssues(data.errors);
        setStatuses((prev) => {
          const next = prev.map((s): RowStatus => (s === 'error' ? 'new' : s));
          data.errors!.forEach((e) => (next[e.index] = 'error'));
          return next;
        });
        showToast('error', 'Fix the highlighted rows. Nothing was saved.');
      } else {
        showToast('error', data?.message || 'Import failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const toSave = rows.filter((_, i) => statuses[i] !== 'exists').length;

  return {
    kind, selectKind, loading, fileName, rows, statuses, issues, warnings, done,
    pickFile, removeRow, confirm, reset, toSave, existing: rows.length - toSave,
  };
};

export default useImport;
