import React, { useState } from 'react';
import { View, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ThemedSelect } from '@/components/ui/themed-select';
import { logMaterialUsage } from '@/api/production';
import { fetchProducts } from '@/api/product';

/**
 * LogMaterialModal
 * Props:
 *   orderId   — the production order _id
 *   productId — the product _id so we can look up its rawMaterials from cache
 *   visible   — boolean
 *   onClose   — function
 */
const LogMaterialModal = ({ orderId, productId, visible, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ materialId: '', quantityUsed: '' });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // ── Pull from cache first, only fetches if not already cached ──────────────
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000,
  });

  // ── Find this order's product and extract its raw materials ────────────────
  // fetchProducts returns the array directly (response.data.data)
  const safeProducts = Array.isArray(productsData) ? productsData : (productsData?.data ?? []);
  const product = safeProducts.find((p) => p._id === productId);

  // product.rawMaterials = [{ material: { _id, name, code }, quantity }]
  // (populated because product list controller does .populate("rawMaterials.material"))
  const materialOptions = (product?.rawMaterials ?? []).map((rm) => ({
    label: rm.material?.name ?? `Material ${rm.material}`,
    value: rm.material?._id ?? String(rm.material),
  }));

  const isValid = form.materialId && form.quantityUsed && !isNaN(Number(form.quantityUsed));

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      logMaterialUsage(orderId, {
        materialId: form.materialId,
        quantityUsed: Number(form.quantityUsed),
      }),
    meta: { successMessage: 'Material usage logged' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production', orderId] });
      queryClient.invalidateQueries({ queryKey: ['productionLogs', orderId] });
      onClose();
      setForm({ materialId: '', quantityUsed: '' });
    },
  });

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
          {/* Header */}
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <Text className="text-foreground text-lg font-bold">Log Material Usage</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          <ScrollView
            className="flex-1 px-4"
            contentContainerClassName="py-5 gap-y-5"
            keyboardShouldPersistTaps="handled">
            {/* Material picker */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Raw Material *</Text>
              {materialOptions.length === 0 ? (
                <View className="border-border bg-card rounded-xl border px-4 py-3.5">
                  <Text className="text-muted-foreground text-sm">
                    {product
                      ? 'No raw materials defined for this product.'
                      : 'Loading product data…'}
                  </Text>
                </View>
              ) : (
                <ThemedSelect
                  items={materialOptions}
                  value={form.materialId}
                  onValueChange={(v) => set('materialId', v)}
                  placeholder="Select material"
                />
              )}
            </View>

            {/* Quantity */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Quantity Used *</Text>
              <Input
                placeholder="e.g. 25"
                keyboardType="numeric"
                value={form.quantityUsed}
                onChangeText={(v) => set('quantityUsed', v)}
              />
            </View>
          </ScrollView>

          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={() => mutate()} disabled={isPending || !isValid} className="w-full">
              <Text>{isPending ? 'Logging...' : 'Log Material'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LogMaterialModal;
