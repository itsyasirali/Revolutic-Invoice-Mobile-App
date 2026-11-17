import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchableDropdown from '../../components/ui/SearchableDropdown';
import { useOrganizationSetup } from '@/hooks/organization/useOrganizationSetup';
import {
  INDUSTRIES,
  LOCATIONS,
  CURRENCIES,
  TIMEZONES,
} from '@/data/organizationSetupData';

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

  const toOptions = (list: string[]) => list.map((v) => ({ label: v, value: v }));
  const industryOptions = toOptions(INDUSTRIES);
  const locationOptions = toOptions(LOCATIONS);
  const provinceOptions = toOptions(provincesList);
  const currencyOptions = CURRENCIES.map((c) => ({ label: c.label, value: c.value }));
  const timezoneOptions = toOptions(TIMEZONES);

  return (
    <View className="flex-1 bg-slate-100">
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
              <View className="p-3.5 rounded-md bg-red-50 border border-red-200 flex-row items-start gap-2.5">
                <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginTop: 1 }} />
                <Text className="text-red-600 text-xs font-medium flex-1">{error}</Text>
              </View>
            )}

            {/* ── Organization Name ── */}
            <View>
              <FieldLabel text="Organization Name" required />
              <TextInput
                className="bg-white border border-slate-200 rounded-md px-4 py-3.5 text-slate-800 text-sm font-medium"
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
            <SearchableDropdown
            label="Industry *"
            placeholder="Select Industry..."
            modalTitle="Select Industry"
            searchPlaceholder="Search industry..."
            value={industry}
            options={industryOptions}
            onSelect={(o) => setIndustry(String(o.value))}
            containerStyle="mb-0"
          />

            {/* ── Location + Province row ── */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SearchableDropdown
            label="Location *"
            placeholder="Select Location..."
            modalTitle="Select Location"
            searchPlaceholder="Search location..."
            value={location}
            options={locationOptions}
            onSelect={(o) => handleLocationChange(String(o.value))}
            containerStyle="mb-0"
          />
              </View>
              <View className="flex-1">
                <SearchableDropdown
            label="State / Province"
            placeholder="Select State / Province..."
            modalTitle="Select State / Province"
            searchPlaceholder="Search state / province..."
            value={province}
            options={provinceOptions}
            onSelect={(o) => setProvince(String(o.value))}
            containerStyle="mb-0"
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
                <View className="mt-3 p-4 rounded-md bg-white border border-slate-200 gap-3">
                  <View>
                    <FieldLabel text="Street Address" />
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm"
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
                        className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm"
                        placeholder="e.g. Lahore"
                        placeholderTextColor="#94a3b8"
                        value={city}
                        onChangeText={setCity}
                      />
                    </View>
                    <View className="flex-1">
                      <FieldLabel text="Zip / Postal" />
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm"
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
                <SearchableDropdown
            label="Currency *"
            placeholder="Select Currency..."
            modalTitle="Select Currency"
            searchPlaceholder="Search currency..."
            value={currency}
            options={currencyOptions}
            onSelect={(o) => setCurrency(String(o.value))}
            containerStyle="mb-0"
          />
              </View>
              <View className="flex-1">
                <SearchableDropdown
            label="Time Zone *"
            placeholder="Select Time Zone..."
            modalTitle="Select Time Zone"
            searchPlaceholder="Search time zone..."
            value={timeZone}
            options={timezoneOptions}
            onSelect={(o) => setTimeZone(String(o.value))}
            containerStyle="mb-0"
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
                    Create Organization
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBack}
                disabled={loading}
                className="h-12 rounded-md bg-white border border-slate-200 items-center justify-center active:bg-slate-50 disabled:opacity-50"
              >
                <Text className="text-slate-700 text-sm font-semibold">
                  {isAddingNewOrg ? 'Back to Dashboard' : 'Go Back'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}
