import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/services/api';
import { useRecord } from '@/hooks/records/useRecord';
import { getStatusStyle } from '@/utils/invoiceStatus';
import { formatMoney, formatDate } from '@/utils/money';
import StandardModal from '../ui/StandardModal';
import RecordDetails, { DetailAction } from '../records/RecordDetails';
import QuoteForm from './QuoteForm';
import DownloadPopIn from '../ui/DownloadPopIn';
import * as Print from 'expo-print';
import { savePDFToDevice } from '@/utils/fileSystem';
import { buildQuoteHtml } from '@/utils/quoteDocument';

const QuoteDetails = () => {
  const router = useRouter();
  const { id, record } = useLocalSearchParams();
  const { payload, loading, reload } = useRecord<any>('/api/quotes', id, record, 'quote');
  const [showEdit, setShowEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedName, setSavedName] = useState('');
  const quote = payload?.quote;

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/screens/Quotes' as any));

  const run = async (fn: () => Promise<void>, fallback: string) => {
    try {
      await fn();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || fallback);
    }
  };

  const transition = (path: string, label: string) =>
    run(async () => {
      await axios.post(`/api/quotes/${quote.id}/${path}`);
      await reload();
    }, `Could not mark quote ${label}`);

  const handleSend = () =>
    router.push({ pathname: '/screens/Quotes/email' as any, params: { id: String(quote.id), record: JSON.stringify(quote) } });

  const handleDownload = () =>
    run(async () => {
      const html = await buildQuoteHtml(quote);
      const { uri } = await Print.printToFileAsync({ html });
      const name = `Quote-${quote.quoteNumber}.pdf`;
      if (await savePDFToDevice(uri, name)) {
        setSavedName(name);
        setSaved(true);
      }
    }, 'Failed to download quote');

  const handlePreview = () =>
    router.push({ pathname: '/screens/Quotes/preview' as any, params: { id: String(quote.id) } });

  const handleConvert = () =>
    Alert.alert('Convert', 'Create an invoice from this quote?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Convert',
        onPress: () =>
          run(async () => {
            await axios.post(`/api/quotes/${quote.id}/convert`);
            await reload();
            Alert.alert('Converted', 'An invoice was created from this quote.');
          }, 'Failed to convert quote'),
      },
    ]);

  const handleClone = () =>
    run(async () => {
      const res = await axios.post(`/api/quotes/${quote.id}/clone`);
      const clone = res.data?.quote;
      if (clone?.id) router.replace({ pathname: '/screens/Quotes/details' as any, params: { id: String(clone.id) } });
    }, 'Failed to clone quote');

  const handleDelete = () =>
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          run(async () => {
            await axios.delete(`/api/quotes/${quote.id}`);
            handleBack();
          }, 'Delete failed'),
      },
    ]);

  if (!loading && !quote) return null;
  const status: string = quote?.status || '';
  const customerName = quote?.customer?.displayName || quote?.customer?.companyName || '';

  const actions: DetailAction[] = [{ label: 'Preview', icon: 'visibility', onPress: handlePreview },
    { label: 'Download PDF', icon: 'file-download', onPress: handleDownload },
  ];
  if (['Draft', 'Sent', 'Viewed'].includes(status)) actions.push({ label: 'Send by Email', icon: 'mail-outline', onPress: handleSend });
  if (['Sent', 'Viewed'].includes(status)) {
    actions.push({ label: 'Mark as Accepted', icon: 'check-circle-outline', onPress: () => transition('accept', 'accepted') });
    actions.push({ label: 'Mark as Declined', icon: 'cancel', onPress: () => transition('decline', 'declined') });
  }
  if (status === 'Accepted' && !quote?.convertedInvoiceId) actions.push({ label: 'Convert to Invoice', icon: 'receipt', onPress: handleConvert });
  actions.push({ label: 'Clone Quote', icon: 'content-copy', onPress: handleClone });
  actions.push({ label: 'Delete', icon: 'delete-outline', danger: true, onPress: handleDelete });

  const items: any[] = quote?.items ?? [];

  return (
    <RecordDetails
      title={quote?.quoteNumber || ''}
      loading={loading}
      onBack={handleBack}
      onEdit={status === 'Converted' ? undefined : () => setShowEdit(true)}
      actions={actions}
      stats={[
        { label: 'Total', value: formatMoney(quote?.total, quote?.currency) },
        { label: 'Expires', value: formatDate(quote?.expiryDate) },
      ]}
      icon="document-text-outline"
      name={customerName || quote?.quoteNumber || ''}
      badge={quote ? { label: status, ...getStatusStyle(status) } : undefined}
      description={quote?.notes}
      extra={
        items.length > 0 ? (
          <View className="bg-white rounded-md shadow-sm mb-4 border border-slate-100 p-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2">Items</Text>
            {items.map((it, i) => (
              <View key={it.id ?? i} className="flex-row justify-between py-2 border-b border-slate-50">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-800 text-base">{it.name}</Text>
                  <Text className="text-slate-400 text-xs">
                    {Number(it.quantity)} × {formatMoney(it.rate)}
                  </Text>
                </View>
                <Text className="text-slate-800 font-semibold">{formatMoney(it.amount, quote?.currency)}</Text>
              </View>
            ))}
          </View>
        ) : null
      }
      rows={[
        { label: 'Quote Number', value: quote?.quoteNumber },
        { label: 'Customer', value: customerName },
        { label: 'Quote Date', value: formatDate(quote?.quoteDate) },
        { label: 'Expiry Date', value: formatDate(quote?.expiryDate) },
        { label: 'Reference', value: quote?.referenceNumber },
        { label: 'Subtotal', value: formatMoney(quote?.subTotal, quote?.currency) },
        { label: `Discount (${quote?.discountPercent ?? 0}%)`, value: formatMoney(quote?.discount, quote?.currency) },
        { label: 'Shipping', value: formatMoney(quote?.shipping, quote?.currency) },
        { label: 'Adjustment', value: formatMoney(quote?.adjustment, quote?.currency) },
        { label: 'Total', value: formatMoney(quote?.total, quote?.currency) },
        { label: 'Terms', value: quote?.terms },
        { label: 'Invoice', value: quote?.convertedInvoice?.invoiceNumber },
      ]}
      modals={
        <>
        <DownloadPopIn visible={saved} fileName={savedName} onHide={() => setSaved(false)} />
        <StandardModal visible={showEdit} onClose={() => setShowEdit(false)}>
          <QuoteForm
            quote={quote}
            onCancel={() => setShowEdit(false)}
            onSuccess={() => {
              setShowEdit(false);
              reload();
            }}
          />
        </StandardModal>
        </>
      }
    />
  );
};

export default QuoteDetails;
