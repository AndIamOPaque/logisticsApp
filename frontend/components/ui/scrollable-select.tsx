import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TriggerRef } from '@rn-primitives/select';
import * as React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Generic props for the Universal Select.
 * T represents the shape of the data object you are passing in.
 */
interface ScrollableSelectProps<T> {
  /** The raw array of data objects (e.g., products, users, fruits) */
  items: T[];
  /** The key in your object to use as the Value (default: 'value') */
  valueKey?: keyof T;
  /** The key in your object to use as the Label (default: 'label') */
  labelKey?: keyof T;
  
  /** The currently selected value (string) */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string | undefined) => void;
  
  placeholder?: string;
  groupLabel?: string;
  triggerClassName?: string;
}

export function ScrollableSelect<T extends Record<string, any>>({
  items,
  valueKey = 'value', 
  labelKey = 'label', 
  value,
  onValueChange,
  placeholder = 'Select an item',
  groupLabel,
  portalHost,
  triggerClassName = 'w-full',
}: ScrollableSelectProps<T>) {
  const ref = React.useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  function onTouchStart() {
    if (Platform.OS !== 'web') {
      ref.current?.open();
    }
  }

  return (
    <Select 
      value={value ? String(value) : undefined} 
      onValueChange={(val) => {
        // rn-primitives returns an object { value: string, label: string } or just the string depending on version. 
        // We safely extract the value.
        const newValue = typeof val === 'object' && val !== null && 'value' in val ? (val as any).value : val;
        if (onValueChange) onValueChange(newValue); 
      }}
    >
      <SelectTrigger 
        ref={ref} 
        className={triggerClassName} 
        onTouchStart={onTouchStart}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      
      <SelectContent insets={contentInsets} className={triggerClassName} portalHost={portalHost}>
        <NativeSelectScrollView>
          <SelectGroup>
            {groupLabel && <SelectLabel>{groupLabel}</SelectLabel>}
            
            {items.map((item, index) => {
              // Dynamic key access
              const itemValue = String(item[valueKey]);
              const itemLabel = String(item[labelKey]);
              
              return (
                <SelectItem 
                  key={itemValue || index} 
                  label={itemLabel} 
                  value={itemValue}
                >
                  {itemLabel}
                </SelectItem>
              );
            })}
            
          </SelectGroup>
        </NativeSelectScrollView>
      </SelectContent>
    </Select>
  );
}