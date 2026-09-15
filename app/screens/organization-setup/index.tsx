import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrganizationSetup } from '@/hooks/organization/useOrganizationSetup';
import {
  INDUSTRIES,
  LOCATIONS,
  CURRENCIES,
  TIMEZONES,
} from '@/data/organizationSetupData';

// ─── Searchable Picker Modal ──────────────────────────────────────────────────

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[] | { value: string; label: string }[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const normalized = (options as any[]).map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const filtered = normalized.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ maxHeight: '80%', paddingBottom: insets.bottom }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-[16px] font-bold text-slate-800">{title}</Text>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200">
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-slate-100 rounded-xl px-3 gap-2">
              <Ionicons name="search-outline" size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 text-slate-700 text-sm py-2.5"
                placeholder="Search..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.value === selected;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.value);
                    setSearch('');
                    onClose();
                  }}
                  className={`flex-row items-center justify-between px-5 py-3.5 border-b border-slate-50 active:bg-slate-50 ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  <Text className={`text-[14px] flex-1 pr-3 ${isSelected ? 'text-primary font-semibold' : 'text-slate-700'}`}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color="#1AA3FF" />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View className="py-10 items-center">
                <Ionicons name="search-outline" size={32} color="#cbd5e1" />
                <Text className="text-slate-400 text-sm mt-2">No results found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

// ─── Field Components ─────────────────────────────────────────────────────────

interface LabelProps {
  text: string;
  required?: boolean;
}

const FieldLabel: React.FC<LabelProps> = ({ text, required }) => (
  <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
    {text}
    {required && <Text className="text-red-500"> *</Text>}
  </Text>
);

interface SelectFieldProps {
  label: string;
  value: string;
  displayValue?: string;
  required?: boolean;
  onPress: () => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  displayValue,
  required,
  onPress,
}) => (
  <View>
    <FieldLabel text={label} required={required} />
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3.5 active:bg-slate-50"
    >
      <Text className="text-slate-800 text-sm font-medium flex-1 pr-2" numberOfLines={1}>
        {displayValue || value}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#94a3b8" />
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrganizationSetupScreen() {
  const insets = useSafeAreaInsets();

  const {
    organizationName, setOrganizationName,
    industry, setIndustry,
    location, handleLocationChange,
    province, setProvince,
    provincesList,
    currency, setCurrency,
    timeZone, setTimeZone,
    showAddress, setShowAddress,
    streetAddress, setStreetAddress,
    city, setCity,
    zipCode, setZipCode,
    loading, error,
    isAddingNewOrg,
    handleSubmit,
    handleBack,
  } = useOrganizationSetup();

  // Picker modal state
  const [activePicker, setActivePicker] = useState<
    'industry' | 'location' | 'province' | 'currency' | 'timezone' | null
  >(null);

  const currencyLabel =
    CURRENCIES.find((c) => c.value === currency)?.label || currency;

  return (
    <View className="flex-1 bg-slate-50">
      {/* ── Header ── */}
      <View
        className="bg-white border-b border-slate-100 px-5 flex-row items-center justify-between shadow-sm"
        style={{ paddingTop: insets.top + 10, paddingBottom: 14 }}
      >
        <View className="flex-row items-center gap-3">
          {/* Logo badge */}
          <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center shadow-sm">
            <Text className="text-white font-extrabold text-base">IS</Text>
          </View>
          <View>
            <Text className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Invoice Smarty</Text>
            <Text className="text-[14px] font-bold text-slate-800 leading-tight">
              {isAddingNewOrg ? 'New Organization' : 'Organization Setup'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleBack}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
        >
          <Ionicons name="close" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* ── Form Body ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="px-5 pt-6 gap-5">

            {/* ── Greeting ── */}
            <View className="gap-1">
              <Text className="text-[22px] font-bold text-slate-900 tracking-tight">
                {isAddingNewOrg ? 'Create a New Organization' : 'Welcome aboard! 👋'}
              </Text>
              <Text className="text-sm text-slate-500">
                {isAddingNewOrg
                  ? 'Set up a separate business profile, currency, and address for this workspace.'
                  : 'Enter your organization details to get started with Invoice Smarty.'}
              </Text>
            </View>

            {/* ── Error ── */}
            {error && (
              <View className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex-row items-start gap-2.5">
                <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginTop: 1 }} />
                <Text className="text-red-600 text-xs font-medium flex-1">{error}</Text>
              </View>
            )}

            {/* ── Organization Name ── */}
            <View>
              <FieldLabel text="Organization Name" required />
              <TextInput
                className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm font-medium"
                placeholder="e.g. My Business Ltd."
                placeholderTextColor="#94a3b8"
                value={organizationName}
                onChangeText={setOrganizationName}
                autoFocus
                returnKeyType="next"
              />
              {error && !organizationName.trim() && (
                <Text className="text-red-500 text-xs mt-1 ml-1">Organization name is required</Text>
              )}
            </View>

            {/* ── Industry ── */}
            <SelectField
              label="Industry"
              value={industry}
              required
              onPress={() => setActivePicker('industry')}
            />

            {/* ── Location + Province row ── */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SelectField
                  label="Location"
                  value={location}
                  required
                  onPress={() => setActivePicker('location')}
                />
              </View>
              <View className="flex-1">
                <SelectField
                  label="State / Province"
                  value={province}
                  onPress={() => setActivePicker('province')}
                />
              </View>
            </View>

            {/* ── Optional Address Toggle ── */}
            <View>
              <TouchableOpacity
                onPress={() => setShowAddress(!showAddress)}
                className="flex-row items-center gap-1.5"
              >
                <Ionicons
                  name={showAddress ? 'chevron-up-circle' : 'add-circle'}
                  size={18}
                  color="#1AA3FF"
                />
                <Text className="text-primary text-sm font-semibold">
                  {showAddress ? 'Hide Organization Address' : 'Add Organization Address'}
                </Text>
              </TouchableOpacity>

              {showAddress && (
                <View className="mt-3 p-4 rounded-xl bg-white border border-slate-200 gap-3">
                  <View>
                    <FieldLabel text="Street Address" />
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
                      placeholder="e.g. Office 402, Business Bay"
                      placeholderTextColor="#94a3b8"
                      value={streetAddress}
                      onChangeText={setStreetAddress}
                    />
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <FieldLabel text="City" />
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
                        placeholder="e.g. Lahore"
                        placeholderTextColor="#94a3b8"
                        value={city}
                        onChangeText={setCity}
                      />
                    </View>
                    <View className="flex-1">
                      <FieldLabel text="Zip / Postal" />
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
                        placeholder="e.g. 54000"
                        placeholderTextColor="#94a3b8"
                        value={zipCode}
                        onChangeText={setZipCode}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* ── Currency + Timezone row ── */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SelectField
                  label="Currency"
                  value={currency}
                  displayValue={currencyLabel}
                  required
                  onPress={() => setActivePicker('currency')}
                />
              </View>
              <View className="flex-1">
                <SelectField
                  label="Time Zone"
                  value={timeZone}
                  displayValue={timeZone.length > 22 ? timeZone.substring(0, 22) + '…' : timeZone}
                  required
                  onPress={() => setActivePicker('timezone')}
                />
              </View>
            </View>

            {/* ── Divider ── */}
            <View className="border-t border-slate-200" />

            {/* ── Note Section ── */}
            <View className="gap-2">
              <Text className="text-sm font-bold text-slate-800">Note:</Text>
              <Text className="text-xs text-slate-500 leading-relaxed">
                • You can update these preferences from Settings anytime.{'\n'}
                • Default preferences will be applied for:
              </Text>
              <View className="flex-row flex-wrap gap-x-4 gap-y-2 pl-2 pt-1">
                {['Email Templates', 'Template Customizations', 'Payment Modes'].map((tag) => (
                  <View key={tag} className="flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text className="text-xs font-medium text-slate-700">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Divider ── */}
            <View className="border-t border-slate-200" />

            {/* ── Action Buttons ── */}
            <View className="gap-3 pb-2">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="h-12 rounded-xl bg-primary items-center justify-center flex-row gap-2 shadow-sm active:bg-primary/90 disabled:opacity-60"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-sm font-bold">
                    {isAddingNewOrg ? 'Create Organization' : 'Get Started'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBack}
                disabled={loading}
                className="h-12 rounded-xl bg-white border border-slate-200 items-center justify-center active:bg-slate-50 disabled:opacity-50"
              >
                <Text className="text-slate-700 text-sm font-semibold">
                  {isAddingNewOrg ? 'Back to Dashboard' : 'Go Back'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Picker Modals ── */}
      <PickerModal
        visible={activePicker === 'industry'}
        title="Select Industry"
        options={INDUSTRIES}
        selected={industry}
        onSelect={(v) => setIndustry(v)}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'location'}
        title="Select Location"
        options={LOCATIONS}
        selected={location}
        onSelect={(v) => handleLocationChange(v)}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'province'}
        title="Select State / Province"
        options={provincesList}
        selected={province}
        onSelect={(v) => setProvince(v)}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'currency'}
        title="Select Currency"
        options={CURRENCIES}
        selected={currency}
        onSelect={(v) => setCurrency(v)}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'timezone'}
        title="Select Time Zone"
        options={TIMEZONES}
        selected={timeZone}
        onSelect={(v) => setTimeZone(v)}
        onClose={() => setActivePicker(null)}
      />
    </View>
  );
}
