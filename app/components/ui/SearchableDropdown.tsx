import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  Platform,
  Keyboard,
  Animated,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface DropdownOption {
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: string;
}

interface SearchableDropdownProps {
  label?: string;
  placeholder?: string;
  value?: string | number | null;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  error?: string;
  containerStyle?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  modalTitle?: string;
  leftIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const DropdownItemRow = React.memo(
  ({
    item,
    isSelected,
    onPress,
  }: {
    item: DropdownOption;
    isSelected: boolean;
    onPress: (item: DropdownOption) => void;
  }) => {
    return (
      <Pressable
        onPress={() => onPress(item)}
        className={`flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100 active:bg-slate-100 ${
          isSelected ? "bg-primary/5" : "bg-white"
        }`}
      >
        <View className="flex-1 mr-3">
          <View className="flex-row items-center">
            <Text
              className={`text-[15px] ${
                isSelected
                  ? "font-bold text-primary"
                  : "font-medium text-slate-800"
              }`}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.badge && (
              <View className="ml-2 px-2 py-0.5 rounded-full bg-slate-100">
                <Text className="text-[11px] font-semibold text-slate-600">
                  {item.badge}
                </Text>
              </View>
            )}
          </View>
          {item.sublabel ? (
            <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
              {item.sublabel}
            </Text>
          ) : null}
        </View>

        {isSelected ? (
          <Ionicons name="checkmark-circle" size={20} color="#1AA3FF" />
        ) : (
          <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        )}
      </Pressable>
    );
  },
);
DropdownItemRow.displayName = "DropdownItemRow";

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  placeholder = "Select option...",
  value,
  options = [],
  onSelect,
  error,
  containerStyle = "mb-4",
  disabled = false,
  searchPlaceholder = "Search options...",
  emptyMessage = "No matches found",
  modalTitle,
  leftIcon,
  clearable = false,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  // Keyboard offset animation and height tracking
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen) {
      setKeyboardHeight(0);
      keyboardOffsetAnim.setValue(0);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      Animated.timing(keyboardOffsetAnim, {
        toValue: height,
        duration: Platform.OS === "ios" ? e.duration || 250 : 180,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      Animated.timing(keyboardOffsetAnim, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration || 250 : 180,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isOpen, keyboardOffsetAnim]);

  // Calculate dynamic heights so the sheet and search bar never get pushed off-screen or overlapped
  const maxSheetHeight = useMemo(() => {
    if (keyboardHeight > 0) {
      return Math.max(windowHeight - insets.top - keyboardHeight - 16, 260);
    }
    return Math.round(windowHeight * 0.82);
  }, [windowHeight, insets.top, keyboardHeight]);

  const maxListHeight = useMemo(() => {
    if (keyboardHeight > 0) {
      return Math.max(maxSheetHeight - 128, 140);
    }
    return Math.min(Math.round(windowHeight * 0.5), 380);
  }, [maxSheetHeight, keyboardHeight, windowHeight]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === "") return null;
    return options.find((opt) => String(opt.value) === String(value)) || null;
  }, [value, options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;

    return options.filter((opt) => {
      const matchLabel = opt.label?.toLowerCase().includes(q);
      const matchSub = opt.sublabel?.toLowerCase().includes(q);
      const matchBadge = opt.badge?.toLowerCase().includes(q);
      const matchVal = String(opt.value).toLowerCase().includes(q);
      return matchLabel || matchSub || matchBadge || matchVal;
    });
  }, [options, searchQuery]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setSearchQuery("");
    setIsOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const handleSelectItem = useCallback(
    (item: DropdownOption) => {
      Keyboard.dismiss();
      onSelect(item);
      handleClose();
    },
    [onSelect, handleClose],
  );

  const handleClear = useCallback(
    (e: any) => {
      e?.stopPropagation?.();
      if (onClear) {
        onClear();
      }
    },
    [onClear],
  );

  const renderItem = useCallback(
    ({ item }: { item: DropdownOption }) => {
      const isSelected = selectedOption
        ? String(selectedOption.value) === String(item.value)
        : false;
      return (
        <DropdownItemRow
          item={item}
          isSelected={isSelected}
          onPress={handleSelectItem}
        />
      );
    },
    [selectedOption, handleSelectItem],
  );

  const keyExtractor = useCallback(
    (item: DropdownOption, index: number) => String(item.value ?? index),
    [],
  );

  return (
    <View className={containerStyle}>
      {label && (
        <Text className="text-sm font-semibold mb-2 text-slate-800">
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl border bg-slate-50 ${
          error
            ? "border-red-500"
            : isOpen
              ? "border-primary"
              : "border-slate-200"
        } ${disabled ? "opacity-50" : "active:bg-slate-100/70"}`}
      >
        <View className="flex-row items-center flex-1 mr-2">
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <Text
            className={`text-base flex-1 ${
              selectedOption
                ? "text-slate-800 font-medium"
                : "text-slate-400 font-normal"
            }`}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        <View className="flex-row items-center">
          {clearable && selectedOption && onClear && (
            <Pressable onPress={handleClear} hitSlop={8} className="mr-2 p-0.5">
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </Pressable>
          )}
          <Ionicons
            name="chevron-down"
            size={18}
            color={isOpen ? "#1AA3FF" : "#94a3b8"}
          />
        </View>
      </Pressable>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      {/* Searchable Modal Bottom-Sheet */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          {/* Backdrop */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            accessibilityLabel="Close dropdown"
          >
            <View style={styles.backdrop} />
          </Pressable>

          {/* Animated Container that lifts smoothly above the keyboard */}
          <Animated.View
            style={[
              styles.sheetContainer,
              { paddingBottom: keyboardOffsetAnim },
            ]}
          >
            {/* Bottom Sheet Modal */}
            <View
              style={[
                styles.sheet,
                {
                  maxHeight: maxSheetHeight,
                  paddingBottom:
                    keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 16),
                },
              ]}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-slate-900">
                    {modalTitle || label || "Select Option"}
                  </Text>
                  <View className="ml-2.5 px-2 py-0.5 rounded-full bg-slate-100">
                    <Text className="text-xs font-bold text-slate-500">
                      {filteredOptions.length}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleClose}
                  hitSlop={8}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
                >
                  <Ionicons name="close" size={18} color="#64748b" />
                </Pressable>
              </View>

              {/* Search Input Bar */}
              <View className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <View className="flex-row items-center px-3 py-2 rounded-xl bg-white border border-slate-200">
                  <Ionicons name="search" size={18} color="#94a3b8" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#94a3b8"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    onSubmitEditing={Keyboard.dismiss}
                    clearButtonMode="while-editing"
                    className="flex-1 ml-2.5 text-[15px] text-slate-800 p-0"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => setSearchQuery("")}
                      hitSlop={6}
                      className="mr-1"
                    >
                      <Ionicons name="close-circle" size={16} color="#94a3b8" />
                    </Pressable>
                  )}
                  {keyboardHeight > 0 && (
                    <Pressable
                      onPress={Keyboard.dismiss}
                      hitSlop={6}
                      className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 active:bg-slate-200"
                      accessibilityLabel="Hide keyboard"
                    >
                      <Ionicons name="chevron-down" size={16} color="#64748b" />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Options List */}
              <FlatList
                data={filteredOptions}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                showsVerticalScrollIndicator={true}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={5}
                style={{ maxHeight: maxListHeight }}
                ListEmptyComponent={
                  <View className="py-12 items-center justify-center px-4">
                    <Ionicons name="search-outline" size={40} color="#cbd5e1" />
                    <Text className="text-slate-500 text-sm font-medium mt-2 text-center">
                      {emptyMessage}
                    </Text>
                    {searchQuery ? (
                      <Text className="text-slate-400 text-xs mt-1 text-center">
                        Try searching with a different term
                      </Text>
                    ) : null}
                  </View>
                }
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
});

export default React.memo(SearchableDropdown);
