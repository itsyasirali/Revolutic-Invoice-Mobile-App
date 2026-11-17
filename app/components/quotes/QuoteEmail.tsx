import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from '@/services/api';
import { showToast } from '@/utils/toast';
import InputField from '../ui/InputField';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const splitEmails = (text: string) =>
  text
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);

/** Email composer for a quote: recipients, subject, message and the PDF toggle. */
const QuoteEmail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, record } = useLocalSearchParams();
  const quoteId = Array.isArray(id) ? id[0] : id;

  const [quote, setQuote] = useState<any>(() => {
    try {
      const raw = Array.isArray(record) ? record[0] : record;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!quote);
  const [to, setTo] = useState<string[]>([]);
  const [newTo, setNewTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachPDF, setAttachPDF] = useState(true);
  const [sending, setSending] = useState(false);

  // Always refresh: the list copy has no customer contacts.
  useEffect(() => {
    axios
      .get(`/api/quotes/${quoteId}`)
      .then((r) => setQuote(r.data?.quote))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quoteId]);

  // Prefill once the quote (and its customer contacts) is known.
  useEffect(() => {
    if (!quote) return;
    const emails = (quote.customer?.contacts ?? []).map((c: any) => c.email).filter(Boolean);
    setTo((prev) => (prev.length ? prev : Array.from(new Set(emails as string[])).slice(0, 1)));
    setSubject((s) => s || `Quote - ${quote.quoteNumber}`);
    setMessage(
      (m) =>
        m ||
        `Dear ${quote.customer?.displayName || quote.customer?.companyName || 'Customer'},\n\nThank you for your interest. Please find your quote ${quote.quoteNumber} attached.\n\nKind regards`
    );
  }, [quote]);

  const addTo = () => {
    const parsed = splitEmails(newTo);
    const bad = parsed.find((e) => !EMAIL.test(e));
    if (bad) return Alert.alert('Invalid email', `"${bad}" is not a valid email address.`);
    setTo((prev) => Array.from(new Set([...prev, ...parsed])));
    setNewTo('');
  };

  const send = async () => {
    const pending = splitEmails(newTo);
    const recipients = Array.from(new Set([...to, ...pending]));
    const ccList = splitEmails(cc);
    const bccList = splitEmails(bcc);
    if (recipients.length === 0) return Alert.alert('Recipient needed', 'Add at least one recipient.');
    const bad = [...recipients, ...ccList, ...bccList].find((e) => !EMAIL.test(e));
    if (bad) return Alert.alert('Invalid email', `"${bad}" is not a valid email address.`);

    setSending(true);
    try {
      await axios.post(`/api/quotes/${quoteId}/send`, {
        to: recipients,
        cc: ccList.length ? ccList : undefined,
        bcc: bccList.length ? bccList : undefined,
        subject,
        message,
        attachPDF,
      });
      showToast('success', 'Quote sent');
      router.replace({ pathname: '/screens/Quotes/details' as any, params: { id: String(quoteId) } });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  if (loading && !quote) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1AA3FF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-200" style={{ paddingTop: insets.top + 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold">Email Quote</Text>
        <Pressable onPress={send} disabled={sending} hitSlop={8}>
          {sending ? <ActivityIndicator size="small" color="#1AA3FF" /> : <Text className="text-primary font-bold text-base">Send</Text>}
        </Pressable>
      </View>

      <ScrollView className="flex-1 bg-slate-100" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="bg-white rounded-md border border-slate-100 p-4 mb-4">
          <Text className="text-sm font-semibold mb-2 text-slate-800">To</Text>
          <View className="flex-row flex-wrap mb-2">
            {to.map((e) => (
              <View key={e} className="flex-row items-center bg-primary/10 rounded-full pl-3 pr-2 py-1.5 mr-2 mb-2">
                <Text className="text-primary text-sm">{e}</Text>
                <Pressable onPress={() => setTo((p) => p.filter((x) => x !== e))} hitSlop={6} className="ml-1">
                  <Ionicons name="close-circle" size={16} color="#1AA3FF" />
                </Pressable>
              </View>
            ))}
          </View>
          <InputField
            value={newTo}
            onChangeText={setNewTo}
            placeholder="Add email address"
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={addTo}
            containerStyle="mb-2"
            rightIcon={
              <Pressable onPress={addTo} hitSlop={8}>
                <Ionicons name="add-circle" size={24} color="#1AA3FF" />
              </Pressable>
            }
          />
          <InputField label="Cc" value={cc} onChangeText={setCc} placeholder="Comma separated" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Bcc" value={bcc} onChangeText={setBcc} placeholder="Comma separated" keyboardType="email-address" autoCapitalize="none" containerStyle="mb-0" />
        </View>

        <View className="bg-white rounded-md border border-slate-100 p-4 mb-4">
          <InputField label="Subject" value={subject} onChangeText={setSubject} placeholder="Subject" />
          <InputField
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="Write your message"
            multiline
            numberOfLines={8}
            inputStyle="text-slate-800 text-base flex-1 h-48"
            textAlignVertical="top"
            containerStyle="mb-0"
          />
        </View>

        <View className="bg-white rounded-md border border-slate-100 p-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Ionicons name="document-attach-outline" size={20} color="#64748b" />
            <Text className="ml-2 text-slate-800">Attach quote PDF</Text>
          </View>
          <Switch value={attachPDF} onValueChange={setAttachPDF} trackColor={{ true: '#1AA3FF' }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuoteEmail;
