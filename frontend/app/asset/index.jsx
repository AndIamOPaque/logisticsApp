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
  WrenchIcon,
  PlusIcon,
  XIcon,
  ChevronRightIcon,
  TruckIcon,
  MonitorIcon,
  SofaIcon,
  CogIcon,
  SearchIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { Sidebar } from '@/components/dashboard/sidebar';
import { fetchAssets, createAsset } from '@/api/asset';
import { fetchLocations } from '@/api/location';

// ─── Config ──────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  machinery: { label: 'Machinery', icon: CogIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  vehicle: { label: 'Vehicle', icon: TruckIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  it: { label: 'IT', icon: MonitorIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  furniture: { label: 'Furniture', icon: SofaIcon, color: 'text-green-500', bg: 'bg-green-500/10' },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-green-500', bg: 'bg-green-500/10' },
  maintenance: { label: 'Maintenance', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  retired: { label: 'Retired', color: 'text-muted-foreground', bg: 'bg-muted' },
  sold: { label: 'Sold', color: 'text-red-500', bg: 'bg-red-500/10' },
};

const CATEGORIES = ['machinery', 'vehicle', 'it', 'furniture'];

// ─── Asset Card ───────────────────────────────────────────────────────────────
function AssetCard({ asset, onPress }) {
  const cat = CATEGORY_CONFIG[asset.category] ?? CATEGORY_CONFIG.machinery;
  const sts = STATUS_CONFIG[asset.status] ?? STATUS_CONFIG.active;
  return (
    <View className="bg-card border-b border-border">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center gap-x-3 px-4 py-4">
        <View className={`rounded-xl p-2.5 ${cat.bg}`}>
          <Icon as={cat.icon} className={`size-5 ${cat.color}`} />
        </View>
      <View className="flex-1">
        <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
          {asset.name}
        </Text>
        <Text className="text-muted-foreground mt-0.5 text-xs" numberOfLines={1}>
          {asset.location?.name ?? '—'}
        </Text>
        <View className="mt-1.5 flex-row gap-x-2">
          <View className={`rounded-full px-2 py-0.5 ${cat.bg}`}>
            <Text className={`text-xs font-medium ${cat.color}`}>{cat.label}</Text>
          </View>
          <View className={`rounded-full px-2 py-0.5 ${sts.bg}`}>
            <Text className={`text-xs font-medium ${sts.color}`}>{sts.label}</Text>
          </View>
        </View>
      </View>
      <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Create Modal ────────────────────────────────────────────────────────────
function CreateAssetModal({ visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({
    name: '',
    category: 'machinery',
    location: '',
    status: 'active',
    cost: '',
    notes: '',
    purchaseDate: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const { data: locData } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const locationOptions = (locData?.data ?? []).map((l) => ({ label: l.name, value: l._id }));

  const { mutate, isPending } = useMutation({
    mutationFn: createAsset,
    meta: { successMessage: 'Asset created' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      onClose();
      setForm({
        name: '',
        category: 'machinery',
        location: '',
        status: 'active',
        cost: '',
        notes: '',
        purchaseDate: '',
      });
    },
  });

  const handleSubmit = () => {
    mutate({
      ...form,
      cost: form.cost ? Number(form.cost) : undefined,
      purchaseDate: form.purchaseDate || undefined,
    });
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
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <Text className="text-foreground text-lg font-bold">New Asset</Text>
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
              <Text className="text-foreground text-sm font-medium">Name *</Text>
              <Input
                placeholder="e.g. Injection Moulding Machine 1"
                value={form.name}
                onChangeText={(v) => set('name', v)}
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
                      className={`flex-row items-center gap-x-1.5 rounded-xl border px-3 py-2 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <Icon
                        as={cfg.icon}
                        className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <Text
                        className={`text-sm font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {cfg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Location */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Location *</Text>
              <ThemedSelect
                items={locationOptions}
                value={form.location}
                onValueChange={(v) => set('location', v)}
                placeholder="Select a location"
              />
            </View>

            {/* Cost & Purchase Date */}
            <View className="flex-row gap-x-3">
              <View className="flex-1 gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Cost (₹)</Text>
                <Input
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.cost}
                  onChangeText={(v) => set('cost', v)}
                />
              </View>
              <View className="flex-1 gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Purchase Date</Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={form.purchaseDate}
                  onChangeText={(v) => set('purchaseDate', v)}
                />
              </View>
            </View>

            {/* Notes */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Notes</Text>
              <Input
                placeholder="Any notes about this asset…"
                value={form.notes}
                onChangeText={(v) => set('notes', v)}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button
              onPress={handleSubmit}
              disabled={isPending || !form.name.trim() || !form.location}
              className="w-full">
              <Text>{isPending ? 'Creating...' : 'Create Asset'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    <ModalToast />
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AssetListScreen() {
  const router = useRouter();
  const [createVisible, setCreateVisible] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState(null);
  const tabBarHeight = useBottomTabBarHeight();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['assets', filterCategory],
    queryFn: () => fetchAssets(filterCategory ? { category: filterCategory } : {}),
  });

  const [search, setSearch] = React.useState('');

  const assets = data?.data ?? [];
  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || (a.location?.name || '').toLowerCase().includes(search.toLowerCase()));

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
            <Icon as={WrenchIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Assets</Text>
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
      <View className="border-border bg-card border-b px-4 py-1.5">
        <View className="border-border bg-background flex-row items-center gap-x-2 rounded-xl border px-3 py-2">
          <Icon as={SearchIcon} className="text-muted-foreground size-4" />
          <TextInput
            className="text-foreground flex-1 text-sm"
            placeholder="Search assets…"
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

      {/* Category filter */}
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
          className={`rounded-full border px-3 py-1.5 ${!filterCategory ? 'bg-primary border-primary' : 'border-border bg-transparent'}`}>
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
              className={`flex-row items-center gap-x-1.5 rounded-full border px-3 py-1.5 ${active ? 'bg-primary border-primary' : 'border-border bg-transparent'}`}>
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
            <Text className="text-muted-foreground text-sm">Loading assets…</Text>
          </View>
        )}
        {isError && <ErrorMessage error={{message: 'Could not load assets.'}} onRetry={refetch} />}
        {!isPending && !isError && filteredAssets.length === 0 && (
          <View className="items-center gap-y-3 py-16">
            <View className="bg-muted rounded-full p-4">
              <Icon as={WrenchIcon} className="text-muted-foreground size-8" />
            </View>
            <Text className="text-muted-foreground text-sm">No assets found.</Text>
            {search.length === 0 && (
              <Button size="sm" onPress={() => setCreateVisible(true)}>
                <Text>Add First Asset</Text>
              </Button>
            )}
          </View>
        )}
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset._id}
            asset={asset}
            onPress={() => router.push(`/asset/${asset._id}`)}
          />
        ))}
      </ScrollView>

      <CreateAssetModal visible={createVisible} onClose={() => setCreateVisible(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
