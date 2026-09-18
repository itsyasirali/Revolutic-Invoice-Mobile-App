import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectFieldProps {
  label: string;
  value: string;
  displayValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onPress: () => void;
  containerStyle?: string;
  leftIcon?: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  displayValue,
  placeholder = 'Select an option',
  required,
  error,
  onPress,
  containerStyle = '',
  leftIcon,
}) => {
  const displayText = displayValue || value;

  return (
    <View className={containerStyle}>
      <Text className="text-[12px] font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between bg-white border rounded-xl px-4 py-3.5 ${
          error ? 'border-red-500 bg-red-50/20' : 'border-slate-200 active:bg-slate-50'
        }`}
      >
        <View className="flex-row items-center flex-1 pr-2">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`text-sm font-medium flex-1 ${
              displayText ? 'text-slate-800' : 'text-slate-400'
            }`}
            numberOfLines={1}
          >
            {displayText || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#94a3b8" />
      </TouchableOpacity>

      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default React.memo(SelectField);
