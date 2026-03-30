import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
  iconSize?: number;
};

const Button: React.FC<Props> = ({ onPress, iconSize = 28 }) => {
  return (
    <Pressable
      activeOpacity={0.9}
      onPress={onPress}
      className="absolute right-4 bottom-6 w-14 h-14 rounded-full items-center justify-center shadow-lg bg-blue-600 elevation-8"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Add"
    >
      <Ionicons name="add" size={iconSize} color="#fff" />
    </Pressable>
  );
};

export default Button;
