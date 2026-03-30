import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: string;
    inputStyle?: string;
    labelStyle?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    error,
    containerStyle = 'mb-4',
    inputStyle = 'text-slate-800 text-base flex-1', // Default inner input style
    labelStyle = 'text-sm font-semibold mb-2 text-slate-800',
    leftIcon,
    rightIcon,
    ...props
}) => {
    return (
        <View className={containerStyle}>
            {label && (
                <Text className={labelStyle}>
                    {label}
                </Text>
            )}
            <View className={`flex-row items-center px-4 py-1.5 rounded-xl border bg-slate-50 border-slate-200 ${error ? 'border-red-500' : ''}`}>
                {leftIcon && <View className="mr-3">{leftIcon}</View>}
                <TextInput
                    className={inputStyle}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    keyboardType={keyboardType}
                    blurOnSubmit={false}
                    {...props}
                />
                {rightIcon && <View className="ml-2">{rightIcon}</View>}
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-1">{error}</Text>
            )}
        </View>
    );
};

export default React.memo(InputField);
