import * as React from 'react';
import { ModalToast } from '@/components/ui/modalToast';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeftIcon,
  PencilIcon,
  XIcon,
  PlusIcon,
  WrenchIcon,
  TruckIcon,
  MonitorIcon,
  SofaIcon,
  CogIcon,
  MapPinIcon,
  CalendarIcon,
  IndianRupeeIcon,
  ClipboardListIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ScrollableSelect } from '@/components/ui/scrollable-select';
import { fetchAssetById, updateAsset, addServiceRecord } from '@/api/asset';
import { fetchLocations } from '@/api/location';

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
const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([v, c]) => ({
  value: v,
  label: c.label,
}));
const CATEGORIES = ['machinery', 'vehicle', 'it', 'furniture'];

// ─── Service Record Modal ────────────────────────────────────────────────────
function ServiceModal({ assetId, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ description: '', date: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => addServiceRecord(assetId, data),
    meta: { successMessage: 'Service record added' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset', assetId] });
      onClose();
      setForm({ description: '', date: '' });
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
            <Text className="text-foreground text-lg font-bold">Log Service</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>
          <ScrollView
            className="flex-1 px-4"
            contentContainerClassName="py-5 gap-y-5"
            keyboardShouldPersistTaps="handled">
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Description *</Text>
              <Input
                placeholder="e.g. Oil change, belt replacement…"
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                multiline
                numberOfLines={3}
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Date (optional)</Text>
              <Input
                placeholder="YYYY-MM-DD (defaults to today)"
                value={form.date}
                onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
              />
            </View>
          </ScrollView>
          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button
              onPress={() => mutate(form)}
              disabled={isPending || !form.description.trim()}
              className="w-full">
              <Text>{isPending ? 'Saving...' : 'Log Service'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ asset, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});
  const { data: locData } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const locationOptions = (locData?.data ?? []).map((l) => ({ label: l.name, value: l._id }));

  React.useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name ?? '',
        category: asset.category ?? 'machinery',
        location: asset.location?._id ?? '',
        status: asset.status ?? 'active',
        cost: asset.cost?.toString() ?? '',
        notes: asset.notes ?? '',
      });
    }
  }, [asset]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => updateAsset(asset._id, data),
    meta: { successMessage: 'Asset updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset', asset._id] });
      qc.invalidateQueries({ queryKey: ['assets'] });
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
            <Text className="text-foreground text-lg font-bold">Edit Asset</Text>
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
              <Text className="text-foreground text-sm font-medium">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const cfg = CATEGORY_CONFIG[c];
                  const active = form.category === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => set('category', c)}
                      activeOpacity={0.7}
                      className={`flex-row items-center gap-x-1.5 rounded-xl border px-3 py-2 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <Icon
                        as={cfg.icon}
                        className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <Text
                        className={`text-sm font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Location</Text>
              <ScrollableSelect
                options={locationOptions}
                value={form.location}
                onValueChange={(v) => set('location', v)}
                placeholder="Select location"
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Status</Text>
              <ScrollableSelect
                options={STATUS_OPTIONS}
                value={form.status}
                onValueChange={(v) => set('status', v)}
                placeholder="Select status"
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Cost (₹)</Text>
              <Input
                value={form.cost}
                onChangeText={(v) => set('cost', v)}
                keyboardType="numeric"
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Notes</Text>
              <Input
                value={form.notes}
                onChangeText={(v) => set('notes', v)}
                multiline
                numberOfLines={3}
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [editVisible, setEditVisible] = React.useState(false);
  const [serviceVisible, setServiceVisible] = React.useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAssetById(id),
  });

  const asset = data?.data ?? data;
  const cat = asset ? (CATEGORY_CONFIG[asset.category] ?? CATEGORY_CONFIG.machinery) : null;
  const sts = asset ? (STATUS_CONFIG[asset.status] ?? STATUS_CONFIG.active) : null;

  if (isPending)
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background items-center justify-center"
        edges={['top']}>
        <Text className="text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  if (isError || !asset)
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background items-center justify-center gap-y-3"
        edges={['top']}>
        <Text className="text-red-500">Could not load asset.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
        <Text className="text-foreground mx-3 flex-1 text-base font-bold" numberOfLines={1}>
          {asset.name}
        </Text>
        <Button
          variant="outline"
          size="icon"
          onPress={() => setEditVisible(true)}
          className="rounded-xl">
          <Icon as={PencilIcon} className="text-foreground size-4" />
        </Button>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-5 gap-y-4"
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="flex-row items-center gap-x-3">
          <View className={`rounded-2xl p-3 ${cat.bg}`}>
            <Icon as={cat.icon} className={`size-7 ${cat.color}`} />
          </View>
          <View className="flex-row flex-wrap gap-x-2">
            <View className={`rounded-full px-3 py-1 ${cat.bg}`}>
              <Text className={`text-sm font-semibold ${cat.color}`}>{cat.label}</Text>
            </View>
            <View className={`rounded-full px-3 py-1 ${sts.bg}`}>
              <Text className={`text-sm font-semibold ${sts.color}`}>{sts.label}</Text>
            </View>
          </View>
        </View>

        {/* Details card */}
        <View className="bg-card border-border rounded-2xl border px-4">
          <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
            Details
          </Text>
          {asset.location?.name && (
            <View className="border-border flex-row items-center gap-x-3 border-b py-3">
              <View className="bg-muted rounded-lg p-1.5">
                <Icon as={MapPinIcon} className="text-muted-foreground size-4" />
              </View>
              <View>
                <Text className="text-muted-foreground text-xs">Location</Text>
                <Text className="text-foreground text-sm font-medium">{asset.location.name}</Text>
              </View>
            </View>
          )}
          {asset.purchaseDate && (
            <View className="border-border flex-row items-center gap-x-3 border-b py-3">
              <View className="bg-muted rounded-lg p-1.5">
                <Icon as={CalendarIcon} className="text-muted-foreground size-4" />
              </View>
              <View>
                <Text className="text-muted-foreground text-xs">Purchase Date</Text>
                <Text className="text-foreground text-sm font-medium">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
          {asset.cost !== undefined && (
            <View className="border-border flex-row items-center gap-x-3 border-b py-3">
              <View className="bg-muted rounded-lg p-1.5">
                <Icon as={IndianRupeeIcon} className="text-muted-foreground size-4" />
              </View>
              <View>
                <Text className="text-muted-foreground text-xs">Cost</Text>
                <Text className="text-foreground text-sm font-medium">
                  ₹{asset.cost?.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          )}
          {asset.notes && (
            <View className="flex-row items-start gap-x-3 py-3">
              <View className="bg-muted mt-0.5 rounded-lg p-1.5">
                <Icon as={ClipboardListIcon} className="text-muted-foreground size-4" />
              </View>
              <View className="flex-1">
                <Text className="text-muted-foreground text-xs">Notes</Text>
                <Text className="text-foreground text-sm">{asset.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Service Records */}
        <View className="bg-card border-border rounded-2xl border px-4">
          <View className="flex-row items-center justify-between pt-4 pb-2">
            <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Service Records
            </Text>
            <TouchableOpacity
              onPress={() => setServiceVisible(true)}
              className="flex-row items-center gap-x-1">
              <Icon as={PlusIcon} className="text-primary size-3.5" />
              <Text className="text-primary text-xs font-semibold">Log</Text>
            </TouchableOpacity>
          </View>
          {!asset.serviceRecords || asset.serviceRecords.length === 0 ? (
            <View className="items-center py-6">
              <Text className="text-muted-foreground text-sm">No service records yet.</Text>
            </View>
          ) : (
            [...asset.serviceRecords].reverse().map((rec, i) => (
              <View key={i} className="border-border border-t py-3">
                <View className="mb-1 flex-row items-center gap-x-2">
                  <Icon as={WrenchIcon} className="text-muted-foreground size-3.5" />
                  <Text className="text-muted-foreground text-xs">
                    {new Date(rec.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-foreground text-sm">{rec.description}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ServiceModal
        assetId={id}
        visible={serviceVisible}
        onClose={() => setServiceVisible(false)}
      />
      <EditModal asset={asset} visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
}
