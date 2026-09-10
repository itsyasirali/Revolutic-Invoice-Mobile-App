import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Customer } from "@/types/customer";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import useCustomerForm from "@/hooks/customers/useCustomerForm";
import InputField from "../ui/InputField";
import StandardButton from "../ui/StandardButton";
import SearchableDropdown from "../ui/SearchableDropdown";

interface CustomerFormProps {
  customer?: Customer | null;
  onSave?: (
    customerData: Partial<Customer>,
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onSaveSuccess?: () => void;
  loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onCancel, onSaveSuccess }) => {
  const {
    isEditing,
    customerType,
    companyName,
    displayName,
    currency,
    address,
    remarks,
    contacts,
    contactFirstName,
    contactLastName,
    contactEmail,
    contactPhone,
    loading,
    currencyOptions,

    setCompanyName,
    setDisplayName,
    setAddress,
    setRemarks,
    setContactFirstName,
    setContactLastName,
    setContactEmail,
    setContactPhone,

    handleSelectBusiness,
    handleSelectIndividual,
    handleCurrencySelect,
    addContact,
    removeContact,
    handleSubmit,
  } = useCustomerForm(customer, onSaveSuccess || onCancel);


  return (
    <View className="flex-1 bg-slate-50">
      {/* Pinned Header */}
      <View className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white z-10">
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

      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
                onPress={handleSelectBusiness}
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
                onPress={handleSelectIndividual}
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

          <SearchableDropdown
            label="Currency"
            placeholder="Select currency..."
            searchPlaceholder="Search currency by code or name..."
            value={currency}
            options={currencyOptions}
            onSelect={(opt) => handleCurrencySelect(String(opt.value))}
            leftIcon={<Ionicons name="cash-outline" size={18} color="#1AA3FF" />}
            containerStyle="mb-4"
          />


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
    </View>
  );
};

export default CustomerForm;
