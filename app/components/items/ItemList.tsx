import React from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useItemList } from "@/hooks/items/useItemList";
import { MaterialIcons } from "@expo/vector-icons";
import ItemForm from "./ItemForm";
import RefreshableScrollView from "../ui/RefreshableScrollView";
import InputField from "../ui/InputField";
import StandardModal from "../ui/StandardModal";

const ItemList: React.FC = () => {
  const {
    loading,
    filter,
    setFilter,
    showAddForm,
    setShowAddForm,
    searchQuery,
    setSearchQuery,
    displayItems,
    refetch,
    handleItemPress,
    handleCancelAdd,
  } = useItemList();

  return (
    <>
      <View className="px-4 py-3 bg-slate-50">
        <InputField
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle="mb-0"
        />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-2 bg-slate-50">
        {(["all", "active", "inactive"] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab as any)}
              className={`px-4 py-3 mx-1 rounded-xl flex-row items-center border ${isActive
                ? "bg-primary border-primary"
                : "bg-white border-slate-200"
                }`}
            >
              <Text
                className={`font-bold mr-2 ${isActive ? "text-white" : "text-slate-600"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1 bg-slate-50">
        {loading && displayItems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0891B2" />
          </View>
        ) : (
          <FlatList
            data={displayItems}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refetch}
                tintColor="#0891B2"
                colors={["#0891B2"]}
              />
            }
            ListEmptyComponent={
              <View className="py-8 items-center">
                <MaterialIcons name="inventory-2" size={48} color="#94a3b8" />
                <Text className="text-center text-lg mt-2 text-slate-500">
                  No {filter === "all" ? "" : filter} items found
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleItemPress(item)}
                className="bg-white rounded-xl mb-4 p-5 shadow-sm elevation-2"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 items-center justify-center rounded-full mr-3 bg-primary/10">
                      <Text className="text-2xl font-extrabold text-primary">
                        {item.name?.[0]?.toUpperCase()}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-xl font-bold mb-1 text-slate-800">
                        {item.name}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`px-3 py-1 rounded-full ${item.status === "Active" ? "bg-green-100" : "bg-orange-100" // Kept custom logic if needed, or revert to user's edit if I see it. 
                      }`}
                  >
                    <Text
                      className={`text-xs font-bold ${item.status === "Active" ? "text-green-700" : "text-orange-700"
                        }`}
                    >
                      {item.status || "Active"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 pt-4 flex-row justify-between border-t border-slate-100">
                  <View>
                    <Text className="text-sm font-bold text-slate-400">
                      Selling Price
                    </Text>
                    <Text className="text-lg font-bold text-slate-800">
                      {item.sellingPrice || 0}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold text-slate-400">
                      Unit
                    </Text>
                    <Text className="text-lg font-bold text-slate-800">
                      {item.unit || "-"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      <Pressable
        onPress={() => setShowAddForm(true)}
        className="p-4 rounded-full absolute right-5 bottom-8 bg-primary shadow-lg elevation-4"
      >
        <MaterialIcons name="add" size={28} color="white" />
      </Pressable>

      <StandardModal
        visible={showAddForm}
        onClose={handleCancelAdd}
      >
        <ItemForm
          onCancel={() => {
            handleCancelAdd();
            refetch();
          }}
        />
      </StandardModal>
    </>
  );
};

export default ItemList;
