export interface SortField<T> {
  label: string;
  value: string;
  get: (row: T) => string | number | null | undefined;
}

export type SortState = { value: string; dir: 'asc' | 'desc' } | null;

const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

const compare = (a: string | number | null | undefined, b: string | number | null | undefined) => {
  if (isEmpty(a) || isEmpty(b)) return isEmpty(a) === isEmpty(b) ? 0 : isEmpty(a) ? 1 : -1; // empty values last
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/** Returns a sorted copy (empty values stay last in both directions); the original order when no sort is active. */
export function sortRows<T>(rows: T[], fields: SortField<T>[], sort: SortState): T[] {
  const field = sort && fields.find((f) => f.value === sort.value);
  if (!sort || !field) return rows;
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((x, y) => {
    const ax = field.get(x);
    const ay = field.get(y);
    if (isEmpty(ax) || isEmpty(ay)) return compare(ax, ay);
    return compare(ax, ay) * factor;
  });
}

/** Choosing the same field again flips the direction. */
export const nextSort = (current: SortState, value: string): SortState =>
  current && current.value === value ? { value, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { value, dir: 'asc' };
