import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DetailPageHeaderProps {
  title?: string;
  onBack: () => void;
  onEdit?: () => void;
  onMenu?: () => void;
  rightAction?: React.ReactNode;
}

const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
  title = "",
  onBack,
  onEdit,
  onMenu,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-1 bg-slate-100"
      style={{ paddingTop: insets.top + 3 }}
    >
      <View className="flex-row items-center flex-1 h-12 mr-2">
        <Pressable
          onPress={onBack}
          className="mr-3 p-2 -ml-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text
          className="text-2xl font-normal text-slate-800 flex-1"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {rightAction ? (
        rightAction
      ) : (
        <View className="flex-row items-center h-12">
          {onEdit && (
            <Pressable
              className="p-2"
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <MaterialIcons name="edit" size={24} color="#64748b" />
            </Pressable>
          )}
          {onMenu && (
            <Pressable
              className="p-2"
              onPress={onMenu}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <MaterialIcons name="more-vert" size={24} color="#64748b" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default DetailPageHeader;
