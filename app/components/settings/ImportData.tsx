import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useImport, { IMPORT_KINDS, type RowStatus } from '@/hooks/import/useImport';

// Pick the most descriptive fields of a draft row for a compact summary.
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

const ImportData: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const h = useImport();
  const hasPreview = h.rows.length > 0;

  return (
    <View className="flex-1 bg-slate-100">
      <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 12 }}>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full items-center justify-center -ml-2 active:bg-slate-100">
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-xl font-bold text-slate-800 ml-2">Import Data</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">What to import</Text>
        <View className="flex-row flex-wrap mb-4">
          {IMPORT_KINDS.map((k) => {
            const active = k.kind === h.kind;
            return (
              <Pressable
                key={k.kind}
                onPress={() => h.selectKind(k.kind)}
                className={`flex-row items-center px-3 py-2 rounded-full mr-2 mb-2 border ${active ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Ionicons name={k.icon as any} size={14} color={active ? '#fff' : '#64748b'} />
                <Text className={`ml-1.5 text-xs font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={h.pickFile}
          disabled={h.loading}
          className="bg-white border border-dashed border-gray-300 rounded-md p-5 items-center active:bg-slate-50"
        >
          <Ionicons name="cloud-upload-outline" size={28} color="#1AA3FF" />
          <Text className="text-sm font-semibold text-slate-800 mt-2">
            {h.fileName ? h.fileName : 'Choose a CSV file'}
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">Nothing is saved until you confirm</Text>
        </Pressable>

        {h.loading && <ActivityIndicator className="mt-6" color="#1AA3FF" />}

        {h.done && (
          <View className="bg-emerald-50 border border-emerald-100 rounded-md p-3 mt-4">
            <Text className="text-emerald-700 font-semibold text-sm">Import complete: {h.done}</Text>
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
                        <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>{String(rowTitle(r))}</Text>
                        <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>{rowSub(r)}</Text>
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
        <View className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-100 px-4 pt-3 flex-row" style={{ paddingBottom: insets.bottom + 12 }}>
          <Pressable onPress={h.reset} className="px-5 py-3 rounded-md border border-gray-200 mr-3">
            <Text className="text-slate-600 font-semibold">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={h.confirm}
            disabled={h.loading || h.toSave === 0}
            className={`flex-1 py-3 rounded-md items-center ${h.loading || h.toSave === 0 ? 'bg-primary/40' : 'bg-primary'}`}
          >
            <Text className="text-white font-bold">Import {h.toSave} record{h.toSave === 1 ? '' : 's'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ImportData;
