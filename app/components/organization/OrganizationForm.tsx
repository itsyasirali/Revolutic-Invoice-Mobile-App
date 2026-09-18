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
import { useOrganizationForm } from '@/hooks/organization/useOrganizationForm';
// eslint-disable-next-line import/no-named-as-default
import SelectField from '../ui/SelectField';
// eslint-disable-next-line import/no-named-as-default
import SearchablePickerModal from '../ui/SearchablePickerModal';
import {
  INDUSTRIES,
  LOCATIONS,
  CURRENCIES,
  TIMEZONES,
} from '@/data/organizationSetupData';

interface OrganizationFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  onCancel,
  onSuccess,
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
    currencyLabel,
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
    activePicker,
    setActivePicker,
    handleSubmit,
  } = useOrganizationForm(onCancel, onSuccess);

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
          New Organization
        </Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text
            className={`font-semibold text-base ${
              loading ? 'text-slate-400' : 'text-primary'
            }`}
          >
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </Pressable>
      </View>

      {/* ── Form Body ── */}
      <ScrollView
        className="flex-1 bg-slate-50"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-5 pt-5 gap-5">
          {/* Greeting banner */}
          <View className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
            <Text className="text-[16px] font-bold text-slate-900 tracking-tight">
              Create a New Organization
            </Text>
            <Text className="text-xs text-slate-500 mt-1">
              Set up a separate business profile, currency, and address for this workspace.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex-row items-center gap-2.5">
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
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium"
              placeholder="e.g. Acme Corp"
              placeholderTextColor="#94a3b8"
              value={organizationName}
              onChangeText={setOrganizationName}
              autoCapitalize="words"
            />
          </View>

          {/* 2. Industry */}
          <SelectField
            label="Industry"
            value={industry}
            required
            onPress={() => setActivePicker('industry')}
          />

          {/* 3. Location (Country) */}
          <SelectField
            label="Organization Location"
            value={location}
            required
            onPress={() => setActivePicker('location')}
          />

          {/* 4. State / Province (conditional) */}
          {provincesList.length > 0 && (
            <SelectField
              label="State / Province"
              value={province}
              onPress={() => setActivePicker('province')}
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
              <View className="mt-3 gap-3.5 bg-white border border-slate-200 rounded-2xl p-4">
                <View>
                  <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
                    Street Address
                  </Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
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
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
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
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
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
          <SelectField
            label="Currency"
            value={currency}
            displayValue={currencyLabel}
            required
            onPress={() => setActivePicker('currency')}
          />

          {/* 7. Time Zone */}
          <SelectField
            label="Time Zone"
            value={timeZone}
            required
            onPress={() => setActivePicker('timezone')}
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
              className="h-12 rounded-xl bg-white border border-slate-200 items-center justify-center active:bg-slate-50 disabled:opacity-50"
            >
              <Text className="text-slate-700 text-sm font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Searchable Picker Modals from UI ── */}
      <SearchablePickerModal
        visible={activePicker === 'industry'}
        title="Select Industry"
        options={INDUSTRIES}
        selected={industry}
        onSelect={setIndustry}
        onClose={() => setActivePicker(null)}
      />

      <SearchablePickerModal
        visible={activePicker === 'location'}
        title="Select Location"
        options={LOCATIONS}
        selected={location}
        onSelect={handleLocationChange}
        onClose={() => setActivePicker(null)}
      />

      <SearchablePickerModal
        visible={activePicker === 'province'}
        title="Select State / Province"
        options={provincesList}
        selected={province}
        onSelect={setProvince}
        onClose={() => setActivePicker(null)}
      />

      <SearchablePickerModal
        visible={activePicker === 'currency'}
        title="Select Currency"
        options={CURRENCIES}
        selected={currency}
        onSelect={setCurrency}
        onClose={() => setActivePicker(null)}
      />

      <SearchablePickerModal
        visible={activePicker === 'timezone'}
        title="Select Time Zone"
        options={TIMEZONES}
        selected={timeZone}
        onSelect={setTimeZone}
        onClose={() => setActivePicker(null)}
      />
    </KeyboardAvoidingView>
  );
};

export default OrganizationForm;
