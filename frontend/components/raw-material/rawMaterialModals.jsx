import * as React from 'react';
import {
  View,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ModalToast } from '@/components/ui/modalToast';
import { updateRawMaterial } from '@/api/raw-material';

export function EditModal({ material, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (material) {
      setForm({
        name: material.name ?? '',
        code: material.code ?? '',
        category: material.category ?? '',
        unitOfMeasurement: material.unitOfMeasurement ?? 'kg',
        costPerUnit: material.costPerUnit?.$numberDecimal ?? material.costPerUnit ?? '',
        reorderLevel: String(material.reorderLevel ?? ''),
        reorderQuantity: String(material.reorderQuantity ?? ''),
      });
    }
  }, [material]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      return updateRawMaterial(material._id, {
        ...data,
        costPerUnit: Number(data.costPerUnit),
        reorderLevel: Number(data.reorderLevel),
        reorderQuantity: Number(data.reorderQuantity),
      });
    },
    meta: { successMessage: 'Raw Material updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rawMaterial', material._id] });
      qc.invalidateQueries({ queryKey: ['rawMaterials'] });
      onClose();
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
            contentContainerClassName="py-5 gap-y-5"
            keyboardShouldPersistTaps="handled">
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Name</Text>
              <Input value={form.name} onChangeText={(v) => set('name', v)} />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Code</Text>
              <Input value={form.code} onChangeText={(v) => set('code', v)} />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Category</Text>
              <Input value={form.category} onChangeText={(v) => set('category', v)} />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Unit</Text>
              <Input value={form.unitOfMeasurement} onChangeText={(v) => set('unitOfMeasurement', v)} />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Cost Per Unit (₹)</Text>
              <Input
                value={String(form.costPerUnit)}
                onChangeText={(v) => set('costPerUnit', v)}
                keyboardType="numeric"
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Reorder Level</Text>
              <Input
                value={form.reorderLevel}
                onChangeText={(v) => set('reorderLevel', v)}
                keyboardType="numeric"
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Reorder Quantity</Text>
              <Input
                value={form.reorderQuantity}
                onChangeText={(v) => set('reorderQuantity', v)}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={() => mutate(form)} disabled={isPending} className="w-full">
              <Text>{isPending ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}
