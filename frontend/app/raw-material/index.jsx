import * as React from 'react';
import { ModalToast } from '@/components/ui/modalToast';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FlaskConicalIcon,
  PlusIcon,
  XIcon,
  ChevronRightIcon,
  SearchIcon,
  RecycleIcon,
  BoxIcon,
  ArchiveIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { Sidebar } from '@/components/dashboard/sidebar';
import { fetchRawMaterials, createRawMaterial } from '@/api/raw-material';

// ─── Config ──────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  raw: { label: 'Raw', icon: FlaskConicalIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  parts: { label: 'Parts', icon: BoxIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  recycled: {
    label: 'Recycled',
    icon: RecycleIcon,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  packaging: {
    label: 'Packaging',
    icon: ArchiveIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
};

const CATEGORIES = ['raw', 'parts', 'recycled', 'packaging'];

const UNIT_OPTIONS = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'litre', value: 'litre' },
  { label: 'ml', value: 'ml' },
  { label: 'unit', value: 'unit' },
  { label: 'meter', value: 'meter' },
  { label: 'cm', value: 'cm' },
];

// ─── Raw Material Card ────────────────────────────────────────────────────────
function RawMaterialCard({ material, onPress }) {
  const cfg = CATEGORY_CONFIG[material.category] ?? CATEGORY_CONFIG.raw;
  return (
    <View className="bg-card border-b border-border">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center gap-x-3 px-4 py-4">
        <View className={`rounded-xl p-2.5 ${cfg.bg}`}>
          <Icon as={cfg.icon} className={`size-5 ${cfg.color}`} />
        </View>

      <View className="flex-1">
        <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
          {material.name}
        </Text>
        <Text className="text-muted-foreground mt-0.5 text-xs" numberOfLines={1}>
          {material.code ? `${material.code} · ` : ''}
          {material.unitOfMeasurement}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-x-2">
          <View className={`rounded-full px-2 py-0.5 ${cfg.bg}`}>
            <Text className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</Text>
          </View>
          {material.reorderLevel > 0 && (
            <View className="bg-muted rounded-full px-2 py-0.5">
              <Text className="text-muted-foreground text-xs">
                Reorder @ {material.reorderLevel}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  name: '',
  code: '',
  category: 'raw',
  unitOfMeasurement: 'kg',
  costPerUnit: '',
  reorderLevel: '',
  reorderQuantity: '',
};

function CreateRawMaterialModal({ visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState(INITIAL_FORM);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: createRawMaterial,
    meta: { successMessage: 'Raw material created' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raw-materials'] });
      onClose();
      setForm(INITIAL_FORM);
    },
  });

  const handleSubmit = () => {
    const payload = {
      ...form,
      costPerUnit: form.costPerUnit ? Number(form.costPerUnit) : undefined,
      reorderLevel: form.reorderLevel ? Number(form.reorderLevel) : undefined,
      reorderQuantity: form.reorderQuantity ? Number(form.reorderQuantity) : undefined,
    };
    
    if (!payload.code || !payload.code.trim()) {
      delete payload.code;
    } else {
      payload.code = payload.code.trim();
    }

    mutate(payload);
  };

  const isValid = form.name.trim() && form.category && form.unitOfMeasurement && form.costPerUnit;

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
            <Text className="text-foreground text-lg font-bold">New Raw Material</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          {isError && (
            <View className="px-4 pt-4">
              <ErrorMessage error={error} />
            </View>
          )}

          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20, gap: 20 }}
            keyboardShouldPersistTaps="handled">
            {/* Name */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Name *</Text>
              <Input
                placeholder="e.g. HDPE Granules"
                value={form.name}
                onChangeText={(v) => set('name', v)}
              />
            </View>

            {/* Code */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Code (optional)</Text>
              <Input
                placeholder="e.g. HDPE-001"
                autoCapitalize="characters"
                value={form.code}
                onChangeText={(v) => set('code', v)}
              />
            </View>

            {/* Category */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Category *</Text>
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

            {/* Unit of Measurement */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Unit of Measurement *</Text>
              <ThemedSelect
                items={UNIT_OPTIONS}
                value={form.unitOfMeasurement}
                onValueChange={(v) => set('unitOfMeasurement', v)}
                placeholder="Select unit"
              />
            </View>

            {/* Cost */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Cost per Unit (₹) *</Text>
              <Input
                placeholder="e.g. 85.50"
                keyboardType="numeric"
                value={form.costPerUnit}
                onChangeText={(v) => set('costPerUnit', v)}
              />
            </View>

            {/* Reorder section */}
            <View className="gap-y-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Reorder Settings (optional)
              </Text>
              <View className="flex-row gap-x-3">
                <View className="flex-1 gap-y-1.5">
                  <Text className="text-foreground text-sm font-medium">Reorder Level</Text>
                  <Input
                    placeholder="e.g. 100"
                    keyboardType="numeric"
                    value={form.reorderLevel}
                    onChangeText={(v) => set('reorderLevel', v)}
                  />
                </View>
                <View className="flex-1 gap-y-1.5">
                  <Text className="text-foreground text-sm font-medium">Reorder Qty</Text>
                  <Input
                    placeholder="e.g. 500"
                    keyboardType="numeric"
                    value={form.reorderQuantity}
                    onChangeText={(v) => set('reorderQuantity', v)}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={handleSubmit} disabled={isPending || !isValid} className="w-full">
              <Text>{isPending ? 'Creating...' : 'Create Material'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    <ModalToast />
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function RawMaterialListScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [createVisible, setCreateVisible] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState(null);
  const [search, setSearch] = React.useState('');

  // Debounce the search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['raw-materials', filterCategory, debouncedSearch],
    queryFn: () =>
      fetchRawMaterials({
        ...(filterCategory ? { category: filterCategory } : {}),
        ...(debouncedSearch ? { name: debouncedSearch } : {}),
      }),
  });

  const materials = data?.data ?? [];

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-3">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setSidebarOpen(true)}
            className="rounded-lg h-8 w-8">
            <View className="gap-y-1">
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
              <View className="bg-foreground h-0.5 w-4 rounded-full" />
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
            </View>
          </Button>
          <View className="flex-row items-center gap-x-2">
            <Icon as={FlaskConicalIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Raw Materials</Text>
          </View>
        </View>
        <Button
          size="sm"
          onPress={() => setCreateVisible(true)}
          className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">Add</Text>
        </Button>
      </View>

      {/* Search bar */}
      <View className="border-border bg-card border-b px-4 pt-2 pb-3">
        <View className="border-border bg-background flex-row items-center gap-x-2 rounded-xl border px-3 py-2.5">
          <Icon as={SearchIcon} className="text-muted-foreground size-4" />
          <TextInput
            className="text-foreground flex-1 text-sm"
            placeholder="Search materials…"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon as={XIcon} className="text-muted-foreground size-4" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter bar — fixed height to prevent stretching */}
      <View style={{ height: 46 }} className="border-border bg-card border-b">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
            alignItems: 'center',
            height: 46,
          }}>
          <TouchableOpacity
            onPress={() => setFilterCategory(null)}
            className={`rounded-full border px-3 py-1.5 ${
              !filterCategory ? 'border-primary bg-primary' : 'border-border bg-transparent'
            }`}>
            <Text
              className={`text-xs font-semibold ${!filterCategory ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((c) => {
            const cfg = CATEGORY_CONFIG[c];
            const active = filterCategory === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setFilterCategory(active ? null : c)}
                className={`flex-row items-center gap-x-1.5 rounded-full border px-3 py-1.5 ${
                  active ? 'border-primary bg-primary' : 'border-border bg-transparent'
                }`}>
                <Icon
                  as={cfg.icon}
                  className={`size-3.5 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                />
                <Text
                  className={`text-xs font-semibold ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {cfg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: tabBarHeight + 58,
        }}>
        {isPending && (
          <View className="items-center py-16">
            <Text className="text-muted-foreground text-sm">Loading materials…</Text>
          </View>
        )}
        {isError && <ErrorMessage error={{message: 'Could not load raw materials.'}} onRetry={refetch} />}
        {!isPending && !isError && materials.length === 0 && (
          <View className="items-center gap-y-3 py-16">
            <View className="bg-muted rounded-full p-4">
              <Icon as={FlaskConicalIcon} className="text-muted-foreground size-8" />
            </View>
            <Text className="text-muted-foreground text-sm">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No raw materials yet.'}
            </Text>
            {!debouncedSearch && (
              <Button size="sm" onPress={() => setCreateVisible(true)}>
                <Text>Add First Material</Text>
              </Button>
            )}
          </View>
        )}
        {materials.map((m) => (
          <RawMaterialCard
            key={m._id}
            material={m}
            onPress={() => router.push(`/raw-material/${m._id}`)}
          />
        ))}
      </ScrollView>

      <CreateRawMaterialModal visible={createVisible} onClose={() => setCreateVisible(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
