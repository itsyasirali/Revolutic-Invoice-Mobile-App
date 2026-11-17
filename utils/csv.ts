import * as FileSystem from 'expo-file-system/legacy';
import { saveFileToDevice } from './fileSystem';

const escapeCell = (value: unknown) => {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: unknown[][]) => rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');

/** Writes the rows as a CSV (with a BOM so Excel reads UTF-8) and saves it to Download/InvoiceSmarty. */
export const exportCsv = async (filename: string, rows: unknown[][]): Promise<boolean> => {
  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, '\uFEFF' + toCsv(rows), { encoding: FileSystem.EncodingType.UTF8 });
  return saveFileToDevice(path, filename, 'text/csv');
};
