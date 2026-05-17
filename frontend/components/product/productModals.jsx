import * as React from 'react';
import {
  View,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon, PlusIcon, TrashIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ModalToast } from '@/components/ui/modalToast';
import { updateProduct } from '@/api/product';
import { fetchRawMaterials } from '@/api/raw-material';

export function EditModal({ product, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});
  const [recipe, setRecipe] = React.useState([]);

  // Fetch raw materials for recipe dropdown
  const { data: rawMaterialsData } = useQuery({
    queryKey: ['rawMaterials'],
    queryFn: fetchRawMaterials,
    enabled: visible,
  });

  const rawMaterials = Array.isArray(rawMaterialsData?.data)
    ? rawMaterialsData.data
    : (Array.isArray(rawMaterialsData) ? rawMaterialsData : []);

  const rmOptions = rawMaterials.map(rm => ({
    label: `${rm.name}${rm.code ? ` (${rm.code})` : ''}`,
    value: rm._id,
  }));

  React.useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        code: product.code ?? '',
        unit: product.unit ?? 'kg',
        costPerUnit: product.costPerUnit?.$numberDecimal ?? product.costPerUnit ?? '',
        salesPrice: product.salesPrice?.$numberDecimal ?? product.salesPrice ?? '',
      });
      // Initialize recipe from product.rawMaterials
      setRecipe(
        (product.rawMaterials || []).map(rm => ({
          material: rm.material?._id || rm.material,
          quantity: String(rm.quantity || ''),
        }))
      );
    }
  }, [product]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addRecipeRow = () => {
    setRecipe(r => [...r, { material: '', quantity: '' }]);
  };

  const updateRecipeRow = (index, key, val) => {
    setRecipe(r => r.map((row, i) => i === index ? { ...row, [key]: val } : row));
  };

  const removeRecipeRow = (index) => {
    setRecipe(r => r.filter((_, i) => i !== index));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        costPerUnit: Number(data.costPerUnit),
        salesPrice: Number(data.salesPrice),
        rawMaterials: recipe
          .filter(r => r.material && Number(r.quantity) > 0)
          .map(r => ({
            material: r.material,
            quantity: Number(r.quantity),
          })),
      };
      return updateProduct(product._id, payload);
    },
    meta: { successMessage: 'Product updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', product._id] });
      qc.invalidateQueries({ queryKey: ['products'] });
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
            <Text className="text-foreground text-lg font-bold">Edit Product</Text>
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
              <Text className="text-foreground text-sm font-medium">Unit</Text>
              <Input value={form.unit} onChangeText={(v) => set('unit', v)} />
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
              <Text className="text-foreground text-sm font-medium">Sales Price (₹)</Text>
              <Input
                value={String(form.salesPrice)}
                onChangeText={(v) => set('salesPrice', v)}
                keyboardType="numeric"
              />
            </View>

            {/* Recipe Section */}
            <View className="gap-y-3 pt-2 border-t border-border">
              <View className="flex-row items-center justify-between">
                <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Recipe (Raw Materials)
                </Text>
                <TouchableOpacity
                  onPress={addRecipeRow}
                  className="flex-row items-center gap-x-1">
                  <Icon as={PlusIcon} className="text-primary size-3.5" />
                  <Text className="text-primary text-xs font-semibold">Add</Text>
                </TouchableOpacity>
              </View>

              {recipe.map((row, index) => (
                <View key={index} className="flex-row items-end gap-x-2">
                  <View className="flex-[2]">
                    {index === 0 && (
                      <Text className="text-muted-foreground text-xs mb-1">Material</Text>
                    )}
                    <ThemedSelect
                      items={rmOptions}
                      value={row.material}
                      onValueChange={(v) => updateRecipeRow(index, 'material', v)}
                      placeholder="Select…"
                    />
                  </View>
                  <View className="flex-1">
                    {index === 0 && (
                      <Text className="text-muted-foreground text-xs mb-1">Qty</Text>
                    )}
                    <Input
                      value={row.quantity}
                      onChangeText={(v) => updateRecipeRow(index, 'quantity', v)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => removeRecipeRow(index)}
                    className="bg-destructive/10 rounded-lg p-2.5 mb-0.5">
                    <Icon as={TrashIcon} className="text-destructive size-4" />
                  </TouchableOpacity>
                </View>
              ))}

              {recipe.length === 0 && (
                <Text className="text-muted-foreground text-sm">
                  No raw materials in recipe. Tap + to add.
                </Text>
              )}
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
