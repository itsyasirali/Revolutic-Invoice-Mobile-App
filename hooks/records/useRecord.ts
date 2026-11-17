import { useCallback, useEffect, useState } from 'react';
import axios from '@/services/api';

const parse = (raw?: string | string[]) => {
  try {
    const text = Array.isArray(raw) ? raw[0] : raw;
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

/**
 * Same approach as the customer details: the list passes the record as a
 * JSON route param so the screen renders instantly from local data, then the
 * full record (tasks, items, stats) is refreshed from the API in the background.
 */
export function useRecord<T = any>(url: string, id?: string | string[], local?: string | string[], key?: string) {
  const recordId = Array.isArray(id) ? id[0] : id;
  const initial = parse(local);
  const [payload, setPayload] = useState<T | null>(initial && key ? ({ [key]: initial } as any) : null);
  const [loading, setLoading] = useState(!initial);

  const reload = useCallback(async () => {
    if (!recordId) return;
    try {
      const res = await axios.get(`${url}/${recordId}`);
      setPayload(res.data);
    } catch (e) {
      console.error(`Failed to load ${url}/${recordId}`, e);
    } finally {
      setLoading(false);
    }
  }, [url, recordId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { payload, setPayload, loading, reload, recordId };
}
