import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ListMenuProps } from '@/hooks/records/useListMenu';
import ImportSheet from '../import/ImportSheet';

/**
 * "..." menu of a list screen, same as the web: Sort by, Import, Export as CSV
 * and Refresh List.
 */
const ListMenu: React.FC<{ menu: ListMenuProps }> = ({ menu }) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const activeSort = menu.sort.active;
  const activeLabel = menu.sort.options.find((o) => o.value === activeSort?.value)?.label;

  const close = () => {
    setOpen(false);
    setSortOpen(false);
  };

  const Row: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; trailing?: React.ReactNode; first?: boolean }> = ({
    icon,
    label,
    onPress,
    trailing,
    first,
  }) => (
    <Pressable onPress={onPress} className={`flex-row items-center px-4 py-3.5 active:bg-slate-50 ${first ? '' : 'border-t border-slate-100'}`}>
      <Ionicons name={icon} size={20} color="#1AA3FF" />
      <Text className="flex-1 ml-3 text-base text-slate-800">{label}</Text>
      {trailing}
    </Pressable>
  );

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="More actions"
        className="w-12 h-12 rounded-md bg-white border border-slate-200 items-center justify-center ml-2 active:bg-slate-50"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#475569" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} onPress={close}>
          <View
            className="absolute right-3 bg-white rounded-md shadow-xl border border-slate-100 min-w-[260px] overflow-hidden"
            style={{ top: insets.top + 8 }}
          >
            <Row
              first
              icon="swap-vertical-outline"
              label="Sort by"
              onPress={() => setSortOpen((v) => !v)}
              trailing={
                <View className="flex-row items-center">
                  {activeSort && activeLabel && (
                    <Text className="text-xs text-primary font-semibold mr-1.5" numberOfLines={1}>
                      {activeLabel} {activeSort.dir === 'asc' ? '↑' : '↓'}
                    </Text>
                  )}
                  <Ionicons name={sortOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
                </View>
              }
            />
            {sortOpen &&
              menu.sort.options.map((o) => {
                const active = menu.sort.active?.value === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      menu.sort.onChange(o.value);
                      close();
                    }}
                    className={`flex-row items-center pl-12 pr-4 py-3 border-t border-slate-50 ${active ? 'bg-primary/10' : ''}`}
                  >
                    <Text className={`flex-1 text-[15px] ${active ? 'font-bold text-primary' : 'text-slate-700'}`}>{o.label}</Text>
                    {active && <Ionicons name={menu.sort.active?.dir === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#1AA3FF" />}
                  </Pressable>
                );
              })}
            {sortOpen && activeSort && (
              <Pressable
                onPress={() => {
                  menu.sort.onClear();
                  close();
                }}
                className="flex-row items-center pl-12 pr-4 py-3 border-t border-slate-50"
              >
                <Text className="flex-1 text-[15px] text-slate-500">Clear sort</Text>
                <Ionicons name="close-circle-outline" size={16} color="#94a3b8" />
              </Pressable>
            )}

            {menu.importKind && (
              <Row
                icon="download-outline"
                label={menu.importLabel ?? 'Import'}
                onPress={() => {
                  close();
                  setImportOpen(true);
                }}
              />
            )}

            <Row
              icon="share-outline"
              label="Export as CSV"
              onPress={() => {
                close();
                menu.onExport();
              }}
            />

            <Row
              icon="refresh-outline"
              label="Refresh List"
              onPress={() => {
                close();
                menu.onRefresh();
              }}
            />
          </View>
        </Pressable>
      </Modal>

      {menu.importKind && (
        <ImportSheet
          visible={importOpen}
          kind={menu.importKind}
          title={menu.importLabel ?? 'Import'}
          onClose={() => setImportOpen(false)}
          onImported={menu.onRefresh}
        />
      )}
    </>
  );
};

export default ListMenu;
