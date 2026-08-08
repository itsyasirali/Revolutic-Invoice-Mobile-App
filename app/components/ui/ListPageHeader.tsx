import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ListPageHeaderProps {
  title: string;
  onAddPress: () => void;
}

const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  title,
  onAddPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-1 bg-slate-50"
      style={{ paddingTop: insets.top + 12 }}
    >
      <Text className="text-2xl font-bold text-slate-800">{title}</Text>
      <Pressable
        onPress={onAddPress}
        className="w-12 h-12  rounded-md bg-primary items-center justify-center shadow-sm"
      >
        <MaterialIcons name="add" size={22} color="white" />
      </Pressable>
    </View>
  );
};

export default ListPageHeader;
