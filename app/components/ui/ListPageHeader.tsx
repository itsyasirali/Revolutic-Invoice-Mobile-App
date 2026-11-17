import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSidebar } from "@/context/SidebarContext";
import ListMenu from "./ListMenu";
import type { ListMenuProps } from "@/hooks/records/useListMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ListPageHeaderProps {
  title: string;
  onAddPress: () => void;
  /** The "..." menu (sort, import, export, refresh), shown next to the add button. */
  menu?: ListMenuProps;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  title,
  onAddPress,
  menu,
  showBackButton = true,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();

  const { openSidebar } = useSidebar();

  // Root lists open the sidebar; pass onBackPress to get a back arrow instead.
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      openSidebar();
    }
  };

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-1 bg-slate-100"
      style={{ paddingTop: insets.top + 3 }}
    >
      <View className="flex-row items-center flex-1 mr-2">
        {showBackButton && (
          <Pressable
            onPress={handleBack}
            className="mr-2.5 p-1.5 -ml-1.5 rounded-full active:bg-slate-200"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name={onBackPress ? "arrow-back" : "menu"} size={24} color="#1e293b" />
          </Pressable>
        )}
        <Text
          className="text-2xl font-bold text-slate-800 flex-1"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View className="flex-row items-center">
      <Pressable
        onPress={onAddPress}
        className="w-10 h-10 rounded-md bg-primary items-center justify-center shadow-sm"
      >
        <MaterialIcons name="add" size={20} color="white" />
      </Pressable>
      {menu && <ListMenu menu={menu} />}
      </View>
    </View>
  );
};

export default ListPageHeader;
