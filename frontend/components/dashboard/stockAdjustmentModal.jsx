// components/dashboard/StockAdjustmentModal.jsx
import { ModalToast } from '@/components/ui/modalToast';
import * as React from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { correctStock } from '@/api/product';
import { correctRawMaterialStock } from '@/api/raw-material';
import { fetchLocations } from '@/api/location';
import { XIcon, SlidersHorizontalIcon } from 'lucide-react-native';
import { ThemedSelect } from '@/components/ui/themed-select';

// ─── Constants ────────────────────────────────────────────────────────────────

const ADJUSTMENT_TYPES = [
  { value: 'count_error', label: 'Count Error'  },
  { value: 'wastage',     label: 'Wastage'      },
  { value: 'theft',       label: 'Theft'        },
  { value: 'expiry',      label: 'Expiry'       },
  { value: 'damanged',    label: 'Damaged'      }, // matches schema typo intentionally
];

const INITIAL_FORM = {
  quantity: '',
  reason: '',
  type: 'count_error',
  location: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">
      {children}
    </Text>
  );
}

function TypeChip({
  label,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-3 py-2 rounded-xl border ${
        selected
          ? 'bg-primary/15 border-primary'
          : 'bg-muted border-border'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          selected ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function StockAdjustmentModal({
  item,
  itemModel = 'Product', // 'Product' | 'RawMaterial'
  visible,
  onClose,
}) {
  const [form, setForm] = React.useState(INITIAL_FORM);
  const queryClient = useQueryClient();

  // ── Derived state ──

  const isFormValid =
    form.quantity !== '' &&
    form.reason.trim().length >= 10 &&
    form.location !== '' &&
    form.type !== '';

  const quantityNum = Number(form.quantity);
  const isNegative = !isNaN(quantityNum) && quantityNum < 0;

  // ── Locations via query (not cache-only) ──

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });
  
  const rawLocArray = Array.isArray(locationsData?.data) 
    ? locationsData.data 
    : (Array.isArray(locationsData) ? locationsData : []);

  const locationOptions = rawLocArray.map(loc => ({ label: loc.name, value: loc._id }));

  // ── Mutation ──

  const mutation = useMutation({
    mutationFn: (payload) => {
      const fn = itemModel === 'RawMaterial' ? correctRawMaterialStock : correctStock;
      return fn(item._id, payload);
    },
    meta: { successMessage: 'Stock adjusted successfully' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels', item._id] });
      setForm(INITIAL_FORM);
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!isFormValid || mutation.isPending) return;
    mutation.mutate({
      ...form,
      quantity: quantityNum,
      item: item._id,
      itemModel: itemModel,
    });
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Backdrop tap-to-close */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Sheet */}
        <View className="bg-card rounded-t-3xl border-t border-border">
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
            <View className="flex-row items-center gap-x-2.5">
              <View className="p-2 bg-primary/10 rounded-xl">
                <Icon as={SlidersHorizontalIcon} className="size-4 text-primary" />
              </View>
              <View>
                <Text className="text-card-foreground text-base font-bold">Adjust Stock</Text>
                <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                  {item?.name}{item?.code ? ` · ${item.code}` : ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} className="p-2">
              <Icon as={XIcon} className="size-5 text-muted-foreground" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5"
            contentContainerClassName="py-5 gap-y-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quantity */}
            <View>
              <SectionLabel>Quantity</SectionLabel>
              <TextInput
                placeholder="e.g. -5 to remove, 10 to add"
                placeholderTextColor="#71717a"
                className={`bg-muted p-4 rounded-xl text-foreground text-sm border ${
                  form.quantity !== '' && isNaN(Number(form.quantity))
                    ? 'border-red-500'
                    : isNegative
                    ? 'border-orange-500'
                    : 'border-border'
                }`}
                keyboardType="numbers-and-punctuation"
                value={form.quantity}
                onChangeText={val => setForm(f => ({ ...f, quantity: val }))}
              />
              {isNegative && (
                <Text className="text-orange-500 text-xs mt-1 px-1">
                  This will deduct {Math.abs(quantityNum)} units from stock.
                </Text>
              )}
            </View>

            {/* Reason */}
            <View>
              <SectionLabel>
                Reason ({Math.min(form.reason.trim().length, 999)}/10 min chars)
              </SectionLabel>
              <TextInput
                placeholder="Describe the reason for adjustment…"
                placeholderTextColor="#71717a"
                className={`bg-muted p-4 rounded-xl text-foreground text-sm border min-h-20 ${
                  form.reason.length > 0 && form.reason.trim().length < 10
                    ? 'border-orange-500'
                    : 'border-border'
                }`}
                multiline
                textAlignVertical="top"
                value={form.reason}
                onChangeText={val => setForm(f => ({ ...f, reason: val }))}
              />
            </View>

            {/* Adjustment Type */}
            <View>
              <SectionLabel>Adjustment Type</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                {ADJUSTMENT_TYPES.map(({ value, label }) => (
                  <TypeChip
                    key={value}
                    label={label}
                    selected={form.type === value}
                    onPress={() => setForm(f => ({ ...f, type: value }))}
                  />
                ))}
              </View>
            </View>

            {/* Location */}
            <View>
              <SectionLabel>Location</SectionLabel>
              <ThemedSelect
                items={locationOptions}
                value={form.location}
                onValueChange={val => setForm(f => ({ ...f, location: val }))}
                placeholder="Select a location…"
              />
            </View>

            {/* Error message */}
            {mutation.isError && (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <Text className="text-red-500 text-sm text-center">
                  {mutation.error?.message ?? 'Something went wrong. Please try again.'}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-x-3 pb-2">
              <TouchableOpacity
                className="flex-1 bg-muted py-4 rounded-xl items-center border border-border"
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text className="text-muted-foreground font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-[2] py-4 rounded-xl items-center ${
                  isFormValid && !mutation.isPending
                    ? 'bg-primary'
                    : 'bg-muted opacity-40'
                }`}
                onPress={handleSubmit}
                disabled={!isFormValid || mutation.isPending}
                activeOpacity={0.8}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-primary-foreground font-bold text-sm">
                    Submit Correction
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    <ModalToast />
    </Modal>
  );
}