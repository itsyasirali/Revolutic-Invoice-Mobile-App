import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
} from "react-native";
import { Item } from "@/types/items";
import { useItemForm } from "@/hooks/items/useItemForm";
import InputField from "../ui/InputField";

interface ItemFormProps {
  item?: Item | null;
  onSave?: (itemData: Partial<Item>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  loading?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onCancel,
}) => {
  const {
    isEditing,
    name,
    description,
    unit,
    sellingPrice,
    loading,

    setName,
    setDescription,
    setUnit,
    setSellingPrice,

    handleSubmit,
  } = useItemForm(item, onCancel);

  const [paddingBottom, setPaddingBottom] = useState(10);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setPaddingBottom(300);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setPaddingBottom(10);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const units = ["Hour", "Daily", "Monthly", "Project Base", "Contract"];

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom }}
    >
      {/* Header */}
      <View
        className="flex-row justify-between items-center px-4 py-5 border-b border-slate-200 bg-white"
      >
        <Pressable onPress={onCancel}>
          <Text className="text-primary font-semibold text-base">Cancel</Text>
        </Pressable>
        <Text className="font-bold text-lg text-slate-800">
          {isEditing ? "Edit Item" : "Add Item"}
        </Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text
            className={`font-semibold text-base ${loading ? "text-slate-400" : "text-primary"}`}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      {/* Form Fields */}
      <View className="px-4 py-6">
        {/* Item Name */}
        <InputField
          label="Item Name *"
          value={name}
          onChangeText={setName}
          placeholder="Enter item name"
        />

        {/* Description */}
        <InputField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={3}
          inputStyle="text-slate-800 text-base flex-1 h-24"
          textAlignVertical="top"
        />

        {/* Unit Selection */}
        <View className="mb-5">
          <Text className="text-sm font-semibold mb-2 text-slate-800">
            Unit *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {units.map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  className={`px-4 py-2.5 rounded-lg mr-2 border ${unit === u ? "bg-primary border-primary" : "bg-white border-slate-200"
                    }`}
                >
                  <Text
                    className={`font-semibold ${unit === u ? "text-white" : "text-slate-600"
                      }`}
                  >
                    {u}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Selling Price */}
        <InputField
          label="Selling Price *"
          value={sellingPrice}
          onChangeText={setSellingPrice}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );
};

export default ItemForm;
