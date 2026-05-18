import * as React from 'react';
import {
  View,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon, FlaskConicalIcon, BoxIcon, RecycleIcon, ArchiveIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ModalToast } from '@/components/ui/modalToast';
import { updateRawMaterial } from '@/api/raw-material';

// ─── Enums from model ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  raw:       { label: 'Raw',       icon: FlaskConicalIcon, color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  parts:     { label: 'Parts',     icon: BoxIcon,          color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  recycled:  { label: 'Recycled',  icon: RecycleIcon,      color: 'text-green-500',  bg: 'bg-green-500/10' },
  packaging: { label: 'Packaging', icon: ArchiveIcon,      color: 'text-purple-500', bg: 'bg-purple-500/10' },
};
const CATEGORIES = ['raw', 'parts', 'recycled', 'packaging'];

const UNIT_OPTIONS = [
  { label: 'kg',    value: 'kg' },
  { label: 'g',     value: 'g' },
  { label: 'litre', value: 'litre' },
  { label: 'ml',    value: 'ml' },
  { label: 'unit',  value: 'unit' },
  { label: 'meter', value: 'meter' },
  { label: 'cm',    value: 'cm' },
];

export function EditModal({ material, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (material) {
      setForm({
        name:              material.name ?? '',
        code:              material.code ?? '',
        category:          material.category ?? 'raw',
        unitOfMeasurement: material.unitOfMeasurement ?? 'kg',
        costPerUnit:       String(material.costPerUnit?.$numberDecimal ?? material.costPerUnit ?? ''),
        reorderLevel:      String(material.reorderLevel ?? ''),
        reorderQuantity:   String(material.reorderQuantity ?? ''),
      });
    }
  }, [material]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const { mutate, isPending } = useMutation({
    mutationFn: (data) =>
      updateRawMaterial(material._id, {
        ...data,
        costPerUnit:     Number(data.costPerUnit),
        reorderLevel:    Number(data.reorderLevel) || 0,
        reorderQuantity: Number(data.reorderQuantity) || 0,
      }),
    meta: { successMessage: 'Raw Material updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rawMaterial', material._id] });
      qc.invalidateQueries({ queryKey: ['raw-materials'] });
      onClose();
    },
    onError: (err) => {
      console.error('Update raw material failed:', err?.message);
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
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <Text className="text-foreground text-lg font-bold">Edit Raw Material</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20, gap: 20 }}
            keyboardShouldPersistTaps="handled">

            {/* Name */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Name</Text>
              <Input value={form.name} onChangeText={(v) => set('name', v)} />
            </View>

            {/* Code */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Code (optional)</Text>
              <Input
                value={form.code}
                onChangeText={(v) => set('code', v)}
                autoCapitalize="characters"
                placeholder="e.g. HDPE-001"
              />
            </View>

            {/* Category — chip select */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const cfg = CATEGORY_CONFIG[c];
                  const active = form.category === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => set('category', c)}
                      className={`flex-row items-center gap-x-1.5 rounded-xl border px-3 py-2 ${
                        active ? 'border-primary bg-primary/5' : 'border-border bg-card'
                      }`}>
                      <Icon
                        as={cfg.icon}
                        className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <Text
                        className={`text-sm font-medium ${
                          active ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                        {cfg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Unit — dropdown */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Unit of Measurement</Text>
              <ThemedSelect
                items={UNIT_OPTIONS}
                value={form.unitOfMeasurement}
                onValueChange={(v) => set('unitOfMeasurement', v)}
                placeholder="Select unit"
              />
            </View>

            {/* Cost */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Cost Per Unit (₹)</Text>
              <Input
                value={form.costPerUnit}
                onChangeText={(v) => set('costPerUnit', v)}
                keyboardType="numeric"
              />
            </View>

            {/* Reorder */}
            <View className="flex-row gap-x-3">
              <View className="flex-1 gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Reorder Level</Text>
                <Input
                  value={form.reorderLevel}
                  onChangeText={(v) => set('reorderLevel', v)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1 gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Reorder Qty</Text>
                <Input
                  value={form.reorderQuantity}
                  onChangeText={(v) => set('reorderQuantity', v)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </ScrollView>

          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={() => mutate(form)} disabled={isPending || !form.name?.trim()} className="w-full">
              <Text>{isPending ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}
