import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useItemDetails } from "@/hooks/items/useItemDetails";
import ItemForm from "./ItemForm";
import StandardModal from "../ui/StandardModal";

const ItemDetails: React.FC = () => {
  const {
    itemData,
    showEditForm,
    showCloneForm,
    showMenu,
    expandMoreInfo,

    setShowEditForm,
    setShowCloneForm,
    setShowMenu,
    setExpandMoreInfo,

    handleStatusToggle,
    handleDelete,
    router,
  } = useItemDetails();

  if (!itemData) {
    return (
      <View className="flex-1 p-4 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">Loading...</Text>
      </View>
    );
  }

  const statusColor = itemData.status === "Active" ? "bg-green-100" : "bg-orange-100";
  const statusTextColor = itemData.status === "Active" ? "text-green-700" : "text-orange-700";

  // Header stats section
  const renderHeaderStats = () => (
    <View className="bg-slate-100 px-4 py-4 flex-row border-b border-slate-200">
      <View className="flex-1 pl-4">
        <Text className="text-slate-500 text-sm uppercase mb-1">Selling Price</Text>
        <Text className="text-2xl font-bold text-slate-800">
          {itemData.sellingPrice || 0}
        </Text>
      </View>
      <View className="flex-1 pr-4 border-l pl-4 border-slate-400">
        <Text className="text-slate-500 text-sm uppercase mb-1">Unit</Text>
        <Text className="text-2xl font-bold text-slate-800">
          {itemData.unit || "-"}
        </Text>
      </View>
    </View>
  );

  // Details tab content
  const renderDetails = () => (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      {/* Profile Card */}
      <View className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-slate-100">
        <View className="flex-row items-center mb-1">
          <Ionicons name="cube-outline" size={20} color="#64748b" />
          <Text className="ml-2 text-2xl font-normal text-slate-800">
            {itemData.name}
          </Text>
          <View className={`ml-2 px-3 py-1.5 rounded-full ${statusColor}`}>
            <Text className={`text-xs font-bold ${statusTextColor}`}>
              {itemData.status || "Active"}
            </Text>
          </View>
        </View>
        {itemData.description && (
          <Text className="ml-7 mt-2 text-base text-slate-500">
            {itemData.description}
          </Text>
        )}
      </View>

      {/* Accordion: More Information */}
      <View className="bg-white rounded-lg shadow-sm mb-4 border border-slate-100 overflow-hidden">
        <Pressable
          onPress={() => setExpandMoreInfo(!expandMoreInfo)}
          className="flex-row justify-between items-center p-4 bg-white"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="grid-view" size={20} color="#475569" />
            <Text className="ml-3 text-lg font-semibold text-slate-800">More Information</Text>
          </View>
          <MaterialIcons
            name={expandMoreInfo ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#64748b"
          />
        </Pressable>
        {expandMoreInfo && (
          <View className="px-4 pb-4 bg-white">
            <View className="flex-row py-2 border-b border-slate-50">
              <Text className="text-slate-500 text-base flex-1">Item Type</Text>
              <Text className="text-slate-800 text-base flex-1 text-right">Sales Item</Text>
            </View>
            <View className="flex-row py-2 border-b border-slate-50">
              <Text className="text-slate-500 flex-1">Unit</Text>
              <Text className="text-slate-800 text-base flex-1 text-right">{itemData.unit || "-"}</Text>
            </View>
            <View className="flex-row py-2 border-b border-slate-50">
              <Text className="text-slate-500 flex-1">Selling Price</Text>
              <Text className="text-slate-800 text-base flex-1 text-right">{itemData.sellingPrice || 0}</Text>
            </View>
            <View className="flex-row py-2">
              <Text className="text-slate-500 flex-1">Status</Text>
              <Text className="text-slate-800 text-base flex-1 text-right">{itemData.status || "Active"}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center p-4 pt-12 bg-slate-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-normal text-slate-800 flex-1" numberOfLines={1}>
          {itemData.name}
        </Text>
        <View className="flex-row">
          <Pressable className="p-2" onPress={() => setShowEditForm(true)}>
            <MaterialIcons name="edit" size={24} color="#64748b" />
          </Pressable>
          <Pressable className="p-2" onPress={() => setShowMenu(true)}>
            <MaterialIcons name="more-vert" size={24} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {renderHeaderStats()}
      {renderDetails()}

      {/* Edit Modal */}
      <StandardModal visible={showEditForm} onClose={() => setShowEditForm(false)}>
        <ItemForm
          item={itemData}
          onCancel={() => {
            setShowEditForm(false);
          }}
        />
      </StandardModal>

      {/* Clone Modal */}
      <StandardModal visible={showCloneForm} onClose={() => setShowCloneForm(false)}>
        <ItemForm
          item={{ ...itemData, id: '', name: `${itemData.name} - Copy` } as any}
          onCancel={() => {
            setShowCloneForm(false);
            router.back();
          }}
        />
      </StandardModal>


      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }} onPress={() => setShowMenu(false)}>
          <View className="absolute top-3 right-3 bg-white rounded-md shadow-xl border border-slate-100 py-2 min-w-[280px]">
            <Pressable
              onPress={() => { setShowMenu(false); setShowCloneForm(true); }}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <Text className="text-base text-slate-800">Clone Item</Text>
              <MaterialIcons name="content-copy" size={20} color="#64748b" />
            </Pressable>

            <View className="h-[1px] bg-slate-100 my-1" />

            <Pressable onPress={handleStatusToggle} className="px-4 py-3.5">
              <Text className="text-base text-slate-800">
                Mark as {itemData.status === "Active" ? "Inactive" : "Active"}
              </Text>
            </Pressable>

            <Pressable onPress={handleDelete} className="px-4 py-3.5">
              <Text className="text-base text-slate-800">Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ItemDetails;
