import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { OrganizationData } from '@/types/organization';
import { useOrganizationForm } from '@/hooks/organization/useOrganizationForm';
import SearchableDropdown from '../ui/SearchableDropdown';
import {
  INDUSTRIES,
  LOCATIONS,
  CURRENCIES,
  TIMEZONES,
} from '@/data/organizationSetupData';

interface OrganizationFormProps {
  onCancel: () => void;
  onSuccess?: (() => void) | undefined;
  organization?: OrganizationData | null;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  onCancel,
  onSuccess,
  organization,
}) => {
  const insets = useSafeAreaInsets();
  const {
    organizationName,
    setOrganizationName,
    industry,
    setIndustry,
    location,
    handleLocationChange,
    province,
    setProvince,
    provincesList,
    currency,
    setCurrency,
    timeZone,
    setTimeZone,
    showAddress,
    setShowAddress,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    zipCode,
    setZipCode,
    loading,
    error,
    handleSubmit,
    isEditing,
  } = useOrganizationForm(onCancel, onSuccess, organization);

  const toOptions = (list: string[]) => list.map((v) => ({ label: v, value: v }));
  const industryOptions = toOptions(INDUSTRIES);
  const locationOptions = toOptions(LOCATIONS);
  const provinceOptions = toOptions(provincesList);
  const currencyOptions = CURRENCIES.map((c) => ({ label: c.label, value: c.value }));
  const timezoneOptions = toOptions(TIMEZONES);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      {/* ── Modal Header (matches CustomerForm pattern) ── */}
      <View className="flex-row justify-between items-center px-4 py-3.5 border-b border-gray-100">
        <Pressable onPress={onCancel} disabled={loading}>
          <Text className="text-slate-600 font-medium text-base">Cancel</Text>
        </Pressable>
        <Text className="text-lg font-bold text-slate-800">
          {isEditing ? 'Edit Organization' : 'New Organization'}
        </Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text
            className={`font-semibold text-base ${
              loading ? 'text-slate-400' : 'text-primary'
            }`}
          >
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save' : 'Create'}
          </Text>
        </Pressable>
      </View>

      {/* ── Form Body ── */}
      <ScrollView
        className="flex-1 bg-slate-100"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-5 pt-5 gap-5">
          {/* Greeting banner */}
          <View className="bg-primary/5 border border-primary/15 rounded-md p-4">
            <Text className="text-[16px] font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Organization' : 'Create a New Organization'}
            </Text>
            <Text className="text-xs text-slate-500 mt-1">
              Set up a separate business profile, currency, and address for this workspace.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-md p-3.5 flex-row items-center gap-2.5">
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="text-red-700 text-xs flex-1 font-medium">
                {error}
              </Text>
            </View>
          ) : null}

          {/* 1. Organization Name */}
          <View>
            <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
              Organization Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm font-medium"
              placeholder="e.g. Acme Corp"
              placeholderTextColor="#94a3b8"
              value={organizationName}
              onChangeText={setOrganizationName}
              autoCapitalize="words"
            />
          </View>

          {/* 2. Industry */}
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

          {/* 3. Location (Country) */}
          <SearchableDropdown
            label="Organization Location *"
            placeholder="Select Organization Location..."
            modalTitle="Select Organization Location"
            searchPlaceholder="Search organization location..."
            value={location}
            options={locationOptions}
            onSelect={(o) => handleLocationChange(String(o.value))}
            containerStyle="mb-0"
          />

          {/* 4. State / Province (conditional) */}
          {provincesList.length > 0 && (
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
          )}

          {/* 5. Address Toggle */}
          <View>
            <TouchableOpacity
              onPress={() => setShowAddress(!showAddress)}
              className="flex-row items-center gap-2 py-1"
            >
              <Ionicons
                name={showAddress ? 'remove-circle-outline' : 'add-circle-outline'}
                size={18}
                color="#1AA3FF"
              />
              <Text className="text-primary text-sm font-medium">
                {showAddress ? 'Hide Organization Address' : 'Add Organization Address'}
              </Text>
            </TouchableOpacity>

            {showAddress && (
              <View className="mt-3 gap-3.5 bg-white border border-slate-200 rounded-md p-4">
                <View>
                  <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
                    Street Address
                  </Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm"
                    placeholder="123 Main St, Suite 100"
                    placeholderTextColor="#94a3b8"
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
                      City
                    </Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm"
                      placeholder="City"
                      placeholderTextColor="#94a3b8"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
                      Postal / ZIP
                    </Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-800 text-sm"
                      placeholder="ZIP Code"
                      placeholderTextColor="#94a3b8"
                      value={zipCode}
                      onChangeText={setZipCode}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 6. Currency */}
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

          {/* 7. Time Zone */}
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

          {/* ── Submit Button: "Create Organization" ── */}
          <View className="pt-2 gap-3">
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
              onPress={onCancel}
              disabled={loading}
              className="h-12 rounded-md bg-white border border-slate-200 items-center justify-center active:bg-slate-50 disabled:opacity-50"
            >
              <Text className="text-slate-700 text-sm font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
};

export default OrganizationForm;
