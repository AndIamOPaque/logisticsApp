/**
 * ThemedSelect – inline dropdown
 *
 * Props:
 *   items          [{ label, value }]
 *   value          currently selected value string
 *   onValueChange  (value: string) => void
 *   placeholder    string when nothing selected
 */
import React, { useState, useRef } from 'react';
import {
  View, Modal, FlatList, TouchableOpacity, Pressable,
  TouchableWithoutFeedback, Dimensions,
} from 'react-native';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const ITEM_HEIGHT  = 48;   // px per row
const MAX_VISIBLE  = 6;    // rows before scroll kicks in
const DROPDOWN_GAP = 4;    // px between trigger and list

export function ThemedSelect({
  items = [],
  value,
  onValueChange,
  placeholder = 'Select…',
}) {
  const [open, setOpen]       = useState(false);
  const [layout, setLayout]   = useState({ x: 0, y: 0, w: 0, h: 0 });
  const triggerRef            = useRef(null);
  const { height: SCREEN_H }  = Dimensions.get('window');

  const selected = items.find((i) => i.value === value);

  // ── open: measure trigger position in window coordinates ──────────────────
  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setLayout({ x, y, w, h });
      setOpen(true);
    });
  };

  // ── pick a value ──────────────────────────────────────────────────────────
  const pick = (val) => {
    onValueChange?.(val);
    setOpen(false);
  };

  // ── compute dropdown size & position ─────────────────────────────────────
  const dropH        = Math.min(items.length, MAX_VISIBLE) * ITEM_HEIGHT;
  const spaceBelow   = SCREEN_H - layout.y - layout.h - DROPDOWN_GAP;
  const openUpward   = spaceBelow < dropH && layout.y > dropH;
  const dropdownTop  = openUpward
    ? layout.y - dropH - DROPDOWN_GAP
    : layout.y + layout.h + DROPDOWN_GAP;

  return (
    <>
      {/* ── Trigger button ────────────────────────────────────────────────── */}
      <TouchableOpacity
        ref={triggerRef}
        onPress={openDropdown}
        activeOpacity={0.75}
        className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
        <Text
          className={`flex-1 text-sm ${selected ? 'text-foreground' : 'text-muted-foreground'}`}
          numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Icon
          as={open ? ChevronUpIcon : ChevronDownIcon}
          className="text-muted-foreground ml-2 size-4"
        />
      </TouchableOpacity>

      {/* ── Transparent overlay + dropdown list ───────────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}>
        {/* Tapping outside closes the dropdown */}
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={{ flex: 1 }}>
            {/* Dropdown panel */}
            <View
              style={{
                position:     'absolute',
                top:          dropdownTop,
                left:         layout.x,
                width:        layout.w,
                maxHeight:    dropH,
                borderRadius: 12,
                overflow:     'hidden',
                // shadow
                elevation:    12,
                shadowColor:  '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.18,
                shadowRadius:  16,
              }}>
              <FlatList
                data={items}
                keyExtractor={(item) => String(item.value)}
                bounces={false}
                nestedScrollEnabled
                style={{ backgroundColor: 'transparent' }}
                contentContainerStyle={{ borderRadius: 12, overflow: 'hidden' }}
                renderItem={({ item, index }) => {
                  const active  = item.value === value;
                  const isLast  = index === items.length - 1;
                  return (
                    <Pressable
                      onPress={() => pick(item.value)}
                      style={{ height: ITEM_HEIGHT }}
                      className={[
                        'flex-row items-center justify-between px-4',
                        active ? 'bg-muted' : 'bg-card',
                        !isLast ? 'border-b border-border' : '',
                      ].join(' ')}>
                      <Text
                        className={`flex-1 text-sm ${
                          active
                            ? 'text-primary font-semibold'
                            : 'text-foreground'
                        }`}
                        numberOfLines={1}>
                        {item.label}
                      </Text>
                      {active && (
                        <Icon as={CheckIcon} className="text-primary ml-2 size-4" />
                      )}
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
