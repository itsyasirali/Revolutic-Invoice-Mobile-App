import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useImport, { type ImportKind, type RowStatus } from '@/hooks/import/useImport';
import StandardModal from '../ui/StandardModal';

// The most descriptive fields of a draft row, for a compact summary.
const rowTitle = (r: Record<string, any>) =>
  r.displayName || r.name || r.invoiceNumber || r.quoteNumber || r.paymentNumber || r.vendor || r.description || 'Record';

const rowSub = (r: Record<string, any>) =>
  [r.customerName, r.email, r.invoiceDate || r.quoteDate || r.paymentDate || r.expenseDate, r.total ?? r.amount ?? r.sellingPrice]
    .filter((v) => v !== undefined && v !== null && v !== '')
    .join(' · ');

const STATUS_STYLE: Record<RowStatus, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'New' },
  exists: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Exists' },
  error: { bg: 'bg-red-50', text: 'text-red-600', label: 'Error' },
};

interface Props {
  visible: boolean;
  kind: ImportKind;
  title: string;
  onClose: () => void;
  /** Called after records were saved, to refresh the list behind the sheet. */
  onImported: () => void;
}

/** Import from a CSV without leaving the list: pick a file, review, confirm. */
const ImportBody: React.FC<Omit<Props, 'visible'>> = ({ kind, title, onClose, onImported }) => {
  const h = useImport(kind, onImported);
  const hasPreview = h.rows.length > 0;

  return (
    <View className="flex-1 bg-slate-100">
      <View className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white">
        <Pressable onPress={onClose}>
          <Text className="text-primary font-semibold text-base">{h.done ? 'Close' : 'Cancel'}</Text>
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">{title}</Text>
        <View className="w-14" />
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {!h.done && (
          <Pressable
            onPress={h.pickFile}
            disabled={h.loading}
            className="bg-white border border-dashed border-gray-300 rounded-md p-5 items-center active:bg-slate-50"
          >
            <Ionicons name="cloud-upload-outline" size={28} color="#1AA3FF" />
            <Text className="text-sm font-semibold text-slate-800 mt-2">{h.fileName ? h.fileName : 'Choose a CSV file'}</Text>
            <Text className="text-xs text-slate-400 mt-0.5">Nothing is saved until you confirm</Text>
          </Pressable>
        )}

        {h.loading && <ActivityIndicator className="mt-6" color="#1AA3FF" />}

        {h.done && (
          <View className="bg-emerald-50 border border-emerald-100 rounded-md p-4 items-center">
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            <Text className="text-emerald-700 font-semibold text-base mt-2">Import complete</Text>
            <Text className="text-emerald-700 text-sm mt-0.5">{h.done}</Text>
          </View>
        )}

        {h.warnings.map((w, i) => (
          <View key={i} className="bg-amber-50 border border-amber-100 rounded-md p-3 mt-3">
            <Text className="text-amber-700 text-xs">{w}</Text>
          </View>
        ))}

        {hasPreview && (
          <>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2 px-1">
              Preview · {h.toSave} to import{h.existing ? `, ${h.existing} already exist` : ''}
            </Text>
            <View className="bg-white rounded-md border border-gray-100">
              {h.rows.map((r, i) => {
                const st = STATUS_STYLE[h.statuses[i] ?? 'new'];
                const issue = h.issues.find((e) => e.index === i);
                return (
                  <View key={i} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                    <View className="flex-row items-center">
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>
                          {String(rowTitle(r))}
                        </Text>
                        <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                          {rowSub(r)}
                        </Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded-full ${st.bg}`}>
                        <Text className={`text-[10px] font-bold ${st.text}`}>{st.label}</Text>
                      </View>
                      <Pressable onPress={() => h.removeRow(i)} className="ml-2 p-1">
                        <Ionicons name="close" size={18} color="#94a3b8" />
                      </Pressable>
                    </View>
                    {issue && <Text className="text-xs text-red-600 mt-1">{issue.message}</Text>}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {hasPreview && (
        <View className="bg-white border-t border-gray-100 px-4 py-3 flex-row">
          <Pressable onPress={h.reset} className="px-5 py-3 rounded-md border border-gray-200 mr-3">
            <Text className="text-slate-600 font-semibold">Clear</Text>
          </Pressable>
          <Pressable
            onPress={h.confirm}
            disabled={h.loading || h.toSave === 0}
            className={`flex-1 py-3 rounded-md items-center ${h.loading || h.toSave === 0 ? 'bg-primary/40' : 'bg-primary'}`}
          >
            <Text className="text-white font-bold">
              Import {h.toSave} record{h.toSave === 1 ? '' : 's'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const ImportSheet: React.FC<Props> = ({ visible, ...rest }) => (
  <StandardModal visible={visible} onClose={rest.onClose}>
    {/* Mounted only while open, so every opening starts from a clean state. */}
    {visible ? <ImportBody {...rest} /> : null}
  </StandardModal>
);

export default ImportSheet;
