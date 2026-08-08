import React from "react";
import { Text, Pressable, ActivityIndicator } from "react-native";

interface StandardButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const StandardButton: React.FC<StandardButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  textClassName = "",
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-light border border-primary";
      case "secondary":
        return "bg-slate-200 border border-slate-200";
      case "outline":
        return "bg-transparent border border-primary";
      case "ghost":
        return "bg-transparent border-0";
      case "danger":
        return "bg-red-50 border border-red-200";
      default:
        return "bg-primary";
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return "text-white";
      case "secondary":
        return "text-slate-800";
      case "outline":
        return "text-primary";
      case "ghost":
        return "text-primary";
      case "danger":
        return "text-red-600";
      default:
        return "text-white";
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-5 px-4 rounded-xl flex-row justify-center items-center ${getButtonStyle()} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#2563eb" : "#fff"
          }
        />
      ) : (
        <Text
          className={`font-semibold text-center ${getTextStyle()} ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default StandardButton;
