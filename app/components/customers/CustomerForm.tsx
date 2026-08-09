import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
} from "react-native";
import { Customer } from "@/types/customer";
import { MaterialIcons } from "@expo/vector-icons";
import { useCustomerForm } from "@/hooks/customers/useCustomerForm";
import InputField from "../ui/InputField";
import StandardButton from "../ui/StandardButton";

interface CustomerFormProps {
  customer?: Customer | null;
  onSave?: (
    customerData: Partial<Customer>,
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onCancel }) => {
  const {
    isEditing,
    customerType,
    companyName,
    displayName,
    address,
    remarks,
    contacts,
    contactFirstName,
    contactLastName,
    contactEmail,
    contactPhone,
    loading,
    showCurrencyDropdown,
    currencyQuery,
    filteredCurrencies,
    currencyInputRef,

    setCustomerType,
    setCompanyName,
    setDisplayName,
    setAddress,
    setRemarks,
    setContactFirstName,
    setContactLastName,
    setContactEmail,
    setContactPhone,
    setCurrencyQuery,
    setShowCurrencyDropdown,

    handleCurrencySelect,
    addContact,
    removeContact,
    handleSubmit,
  } = useCustomerForm(customer, onCancel);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingBottom: 20 }}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white">
        <Pressable onPress={onCancel}>
          <Text className="text-primary font-semibold text-base">Cancel</Text>
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">
          {isEditing ? "Edit Customer" : "Add Customer"}
        </Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text
            className={`font-semibold text-base ${loading ? "text-slate-400" : "text-primary"}`}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      <View className="px-4 py-6">
        {/* Customer Type */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3 text-slate-800">
            Customer Type
          </Text>

          {isEditing ? (
            <View className="self-start flex-row items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <MaterialIcons
                name={customerType === "Business" ? "domain" : "person"}
                size={16}
                color="#1AA3FF"
              />
              <Text className="ml-2 font-semibold text-primary">
                {customerType}
              </Text>
              <MaterialIcons
                name="lock"
                size={14}
                color="#1AA3FF"
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : (
            <View className="flex-row">
              <Pressable
                className={`flex-1 p-3 rounded-xl mr-2 border ${
                  customerType === "Business"
                    ? "bg-primary/10 border-primary"
                    : "bg-slate-50 border-slate-200"
                }`}
                onPress={() => setCustomerType("Business")}
              >
                <Text
                  className={`text-center font-semibold ${
                    customerType === "Business"
                      ? "text-primary"
                      : "text-slate-600"
                  }`}
                >
                  Business
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 p-3 rounded-xl ml-2 border ${
                  customerType === "Individual"
                    ? "bg-primary/10 border-primary"
                    : "bg-slate-50 border-slate-200"
                }`}
                onPress={() => setCustomerType("Individual")}
              >
                <Text
                  className={`text-center font-semibold ${
                    customerType === "Individual"
                      ? "text-primary"
                      : "text-slate-600"
                  }`}
                >
                  Individual
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="rounded-2xl p-6 mb-6 bg-white border border-slate-200">
          <Text className="text-lg font-bold mb-4 text-slate-800">
            Basic Information
          </Text>

          {customerType === "Business" && (
            <InputField
              label="Company Name *"
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter company name"
            />
          )}

          <InputField
            label="Display Name *"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
          />

          <InputField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
          />

          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2 text-slate-800">
              Currency
            </Text>

            <TextInput
              ref={currencyInputRef}
              className="p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-800"
              value={currencyQuery}
              onFocus={() => setShowCurrencyDropdown(true)}
              onChangeText={(t) => {
                setCurrencyQuery(t);
                if (!showCurrencyDropdown) setShowCurrencyDropdown(true);
              }}
              placeholder="Search currency (code or name)"
              placeholderTextColor="#94a3b8"
              blurOnSubmit={false}
            />

            {showCurrencyDropdown && (
              <View
                className="absolute left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg z-50 max-h-60"
                style={{ top: "100%" }}
              >
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="always"
                  showsVerticalScrollIndicator
                  style={{ maxHeight: 240 }}
                >
                  {filteredCurrencies.length === 0 ? (
                    <View className="p-3">
                      <Text className="text-slate-500">No results</Text>
                    </View>
                  ) : (
                    filteredCurrencies.map((c) => (
                      <Pressable
                        key={c.code}
                        className="p-3 border-b border-slate-100"
                        onPress={() => {
                          handleCurrencySelect(c.code);
                          setTimeout(
                            () => currencyInputRef.current?.focus(),
                            0,
                          );
                        }}
                      >
                        <Text className="text-slate-800">
                          {c.code} — {c.name}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>

                <Pressable
                  onPress={() => setShowCurrencyDropdown(false)}
                  className="p-3 rounded-b-xl bg-slate-50 border-t border-slate-200"
                >
                  <Text className="text-center text-slate-500">Close</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Remarks */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2 text-slate-800">
              Remarks
            </Text>
            <TextInput
              className="p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 h-20 text-top"
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Enter remarks"
              placeholderTextColor="#94a3b8"
              multiline
              blurOnSubmit={false}
            />
          </View>
        </View>

        {/* Contacts */}
        <View className="rounded-2xl p-3 mb-6 bg-white border border-slate-200">
          <Text className="text-lg font-bold mb-4 text-slate-800">
            Contacts
          </Text>

          <View className="mb-4">
            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <InputField
                  label=""
                  value={contactFirstName}
                  onChangeText={setContactFirstName}
                  placeholder="First Name"
                  containerStyle="mb-0"
                />
              </View>
              <View className="flex-1 ml-2">
                <InputField
                  label=""
                  value={contactLastName}
                  onChangeText={setContactLastName}
                  placeholder="Last Name"
                  containerStyle="mb-0"
                />
              </View>
            </View>

            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <InputField
                  label=""
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder="Email"
                  keyboardType="email-address"
                  containerStyle="mb-0"
                />
              </View>
              <View className="flex-1 ml-2">
                <InputField
                  label=""
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  containerStyle="mb-0"
                />
              </View>
            </View>

            <StandardButton title="Add Contact" onPress={addContact} />
          </View>

          {/* Existing Contacts */}
          {contacts.map((contact, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between p-3 mb-2 rounded-xl bg-slate-50"
            >
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">
                  {contact.firstName} {contact.lastName}
                </Text>
                <Text className="text-sm text-slate-500">
                  {contact.email} • {contact.contact}
                </Text>
              </View>
              <Pressable onPress={() => removeContact(index)} className="p-2">
                <MaterialIcons name="delete" size={20} color="#94a3b8" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default CustomerForm;
