import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import axios from '@/services/api';
import { savePDFToDevice } from '@/utils/fileSystem';
import { generateInvoiceHTML } from '@/utils/generateInvoiceHTML';
import { quoteToInvoiceDocument, quoteTemplate } from '@/utils/quoteDocument';
import DownloadPopIn from '../ui/DownloadPopIn';

const QuotePreview = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const quoteId = Array.isArray(id) ? id[0] : id;

  const [quote, setQuote] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`/api/quotes/${quoteId}`);
        const q = res.data?.quote;
        if (!alive) return;
        setQuote(q);
        let tpl = q?.template && Object.keys(q.template).length > 3 ? q.template : null;
        if (!tpl) {
          // Same fallback as the web: the default template, else the first one.
          const list = await axios.get('/api/templates');
          const all: any[] = list.data?.templates ?? list.data ?? [];
          tpl = all.find((t) => t.isDefault) || all[0] || null;
        }
        if (alive) setTemplate(tpl);
      } catch (e) {
        console.error('Failed to load quote preview', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [quoteId]);

  const html = useMemo(
    () => (quote ? generateInvoiceHTML(quoteToInvoiceDocument(quote), quoteTemplate(template)) : ''),
    [quote, template]
  );

  const handlePDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html });
      const name = `Quote-${quote.quoteNumber || 'preview'}.pdf`;
      if (await savePDFToDevice(uri, name)) {
        setFileName(name);
        setDone(true);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  const handleSend = () =>
    router.push({ pathname: '/screens/Quotes/email' as any, params: { id: String(quote.id), record: JSON.stringify(quote) } });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1AA3FF" />
      </View>
    );
  }

  if (!quote) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg">Quote not found or failed to load.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-gray-200 p-3 rounded-lg">
          <Text>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const canSend = ['Draft', 'Sent', 'Viewed'].includes(quote.status);

  return (
    <View className="flex-1 bg-slate-100">
      <View className="bg-white px-4 pb-3 border-b border-slate-200 flex-row justify-between items-center" style={{ paddingTop: insets.top + 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">{quote.quoteNumber}</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1">
        <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1, backgroundColor: 'transparent' }} scalesPageToFit javaScriptEnabled domStorageEnabled />
      </View>

      <View className="flex-row gap-3 p-4 bg-slate-100" style={{ paddingBottom: insets.bottom + 12 }}>
        <Pressable onPress={handlePDF} className="flex-1 bg-white border border-slate-300 py-3 rounded-md items-center flex-row justify-center">
          <Ionicons name="share-outline" size={20} color="#334155" />
          <Text className="font-bold text-slate-700 ml-2">PDF</Text>
        </Pressable>
        {canSend && (
          <Pressable onPress={handleSend} className="flex-[2] py-3 rounded-md items-center flex-row justify-center bg-primary">
            <Ionicons name="mail" size={20} color="white" />
            <Text className="font-bold text-white ml-2">Send Quote</Text>
          </Pressable>
        )}
      </View>
      <DownloadPopIn visible={done} fileName={fileName} onHide={() => setDone(false)} />
    </View>
  );
};

export default QuotePreview;
