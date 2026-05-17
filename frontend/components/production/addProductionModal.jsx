import React, { useState } from 'react';
import { ModalToast } from '@/components/ui/modalToast';
import { View, Modal, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { XIcon, PackageIcon, MapPinIcon, StickyNoteIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ThemedSelect } from '@/components/ui/themed-select';
import { createProductionOrder } from '@/api/production';
import { fetchProducts } from '@/api/product';
import { fetchLocations } from '@/api/location';

const INITIAL_FORM = { product: '', location: '', quantityToProduce: '', notes: '' };

const AddProductionModal = ({ visible, onClose }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000,
  });

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 10 * 60 * 1000,
  });

  const safeProducts = Array.isArray(productsData) ? productsData : (productsData?.data ?? []);
  const safeLocations = Array.isArray(locationsData) ? locationsData : (locationsData?.data ?? []);

  const productOptions = safeProducts.map((p) => ({ label: p.name, value: p._id }));
  const locationOptions = safeLocations.map((l) => ({ label: l.name, value: l._id }));

  const isValid =
    form.product &&
    form.location &&
    form.quantityToProduce &&
    !isNaN(Number(form.quantityToProduce));

  const { mutate, isPending } = useMutation({
    mutationFn: createProductionOrder,
    meta: { successMessage: 'Production order created' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production'] });
      onClose();
      setForm(INITIAL_FORM);
    },
  });

  const handleSubmit = () => {
    mutate({ ...form, quantityToProduce: Number(form.quantityToProduce) });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="bg-background flex-1">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* ── Header ── */}
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <Text className="text-foreground text-lg font-bold">New Production Order</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          {/* ── Form ── */}
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20, gap: 20 }}
            keyboardShouldPersistTaps="handled">
            {/* Product */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Product *</Text>
              <ThemedSelect
                items={productOptions}
                value={form.product}
                onValueChange={(v) => set('product', v)}
                placeholder="Select a product"
              />
            </View>

            {/* Location */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Production Location *</Text>
              <ThemedSelect
                items={locationOptions}
                value={form.location}
                onValueChange={(v) => set('location', v)}
                placeholder="Select a location"
              />
            </View>

            {/* Quantity */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Target Quantity *</Text>
              <Input
                placeholder="e.g. 500"
                keyboardType="numeric"
                value={form.quantityToProduce}
                onChangeText={(v) => set('quantityToProduce', v)}
              />
            </View>

            {/* Notes section */}
            <View className="gap-y-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Additional Info (optional)
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Notes</Text>
                <Input
                  placeholder="Any instructions for this batch…"
                  value={form.notes}
                  onChangeText={(v) => set('notes', v)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>

          {/* ── Footer ── */}
          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={handleSubmit} disabled={isPending || !isValid} className="w-full">
              <Text>{isPending ? 'Creating...' : 'Create Order'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    <ModalToast />
    </Modal>
  );
};

export default AddProductionModal;
