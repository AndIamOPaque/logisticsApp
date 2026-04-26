import * as React from 'react';
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
  MapPinIcon,
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  XIcon,
  FactoryIcon,
  WarehouseIcon,
  BuildingIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { fetchLocationById, updateLocation, deactivateLocation } from '@/api/location';

const TYPE_CONFIG = {
  factory: { label: 'Factory', icon: FactoryIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  warehouse: {
    label: 'Warehouse',
    icon: WarehouseIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  office: { label: 'Office', icon: BuildingIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};
const LOCATION_TYPES = ['factory', 'warehouse', 'office'];

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ location, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (location) {
      setForm({
        name: location.name ?? '',
        type: location.type ?? 'factory',
        address: location.address ?? '',
        contact: {
          manager: location.contact?.manager ?? '',
          phone: location.contact?.phone ?? '',
          email: location.contact?.email ?? '',
        },
      });
    }
  }, [location]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setContact = (key, val) =>
    setForm((f) => ({ ...f, contact: { ...f.contact, [key]: val } }));

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => updateLocation(location._id, data),
    meta: { successMessage: 'Location updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['location', location._id] });
      qc.invalidateQueries({ queryKey: ['locations'] });
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
            <Text className="text-foreground text-lg font-bold">Edit Location</Text>
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
              <Text className="text-foreground text-sm font-medium">Type</Text>
              <View className="flex-row gap-x-2">
                {LOCATION_TYPES.map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  const active = form.type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => set('type', t)}
                      activeOpacity={0.7}
                      className={`flex-1 items-center gap-y-1 rounded-xl border py-3 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <Icon
                        as={cfg.icon}
                        className={`size-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <Text
                        className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Address</Text>
              <Input
                value={form.address}
                onChangeText={(v) => set('address', v)}
                multiline
                numberOfLines={2}
              />
            </View>
            <View className="gap-y-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Contact
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Manager</Text>
                <Input
                  value={form.contact?.manager}
                  onChangeText={(v) => setContact('manager', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Phone</Text>
                <Input
                  value={form.contact?.phone}
                  onChangeText={(v) => setContact('phone', v)}
                  keyboardType="phone-pad"
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Email</Text>
                <Input
                  value={form.contact?.email}
                  onChangeText={(v) => setContact('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </ScrollView>
          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={() => mutate(form)} disabled={isPending} className="w-full">
              <Text>{isPending ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View className="border-border flex-row items-start gap-x-3 border-b py-3 last:border-0">
      <View className="bg-muted mt-0.5 rounded-lg p-1.5">
        <Icon as={icon} className="text-muted-foreground size-4" />
      </View>
      <View className="flex-1">
        <Text className="text-muted-foreground mb-0.5 text-xs">{label}</Text>
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [editVisible, setEditVisible] = React.useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ['location', id],
    queryFn: () => fetchLocationById(id),
  });

  const location = data?.data;
  const cfg = location ? (TYPE_CONFIG[location.type] ?? TYPE_CONFIG.factory) : null;

  const { mutate: deactivate, isPending: deactivating } = useMutation({
    mutationFn: (force) => deactivateLocation(id, force),
    meta: { successMessage: 'Location deactivated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      router.back();
    },
    onError: (err) => {
      // Server returns STOCK_EXISTS error when there's still stock
      Alert.alert(
        'Cannot Deactivate',
        err.message + '\n\nForce deactivate and zero out all stock?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Force Deactivate', style: 'destructive', onPress: () => deactivate(true) },
        ]
      );
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Deactivate Location',
      'This will deactivate the location. If it has stock, you will be warned.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => deactivate(false) },
      ]
    );
  };

  if (isPending) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center" edges={['top']}>
        <Text className="text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  }

  if (isError || !location) {
    return (
      <SafeAreaView
        className="bg-background flex-1 items-center justify-center gap-y-3"
        edges={['top']}>
        <Text className="text-red-500">Could not load location.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
        <Text className="text-foreground mx-3 flex-1 text-base font-bold" numberOfLines={1}>
          {location.name}
        </Text>
        <View className="flex-row gap-x-2">
          <Button
            variant="outline"
            size="icon"
            onPress={() => setEditVisible(true)}
            className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onPress={handleDelete}
            disabled={deactivating}
            className="rounded-xl">
            <Icon as={TrashIcon} className="size-4 text-white" />
          </Button>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-5 gap-y-4"
        showsVerticalScrollIndicator={false}>
        {/* Type badge + status */}
        <View className="flex-row items-center gap-x-3">
          <View className={`rounded-2xl p-3 ${cfg.bg}`}>
            <Icon as={cfg.icon} className={`size-7 ${cfg.color}`} />
          </View>
          <View>
            <View className={`rounded-full px-3 py-1 ${cfg.bg} self-start`}>
              <Text className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</Text>
            </View>
            {!location.isActive && (
              <View className="bg-muted mt-1 self-start rounded-full px-3 py-1">
                <Text className="text-muted-foreground text-xs font-medium">Inactive</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details card */}
        <View className="bg-card border-border rounded-2xl border px-4">
          <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
            Details
          </Text>
          <InfoRow icon={MapPinIcon} label="Address" value={location.address} />
        </View>

        {/* Contact card */}
        {(location.contact?.manager || location.contact?.phone || location.contact?.email) && (
          <View className="bg-card border-border rounded-2xl border px-4">
            <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
              Contact
            </Text>
            <InfoRow icon={UserIcon} label="Manager" value={location.contact?.manager} />
            <InfoRow icon={PhoneIcon} label="Phone" value={location.contact?.phone} />
            <InfoRow icon={MailIcon} label="Email" value={location.contact?.email} />
          </View>
        )}

        {/* Capacity card */}
        {(location.capacity?.maxStockUnits || location.capacity?.productionCapacity) && (
          <View className="bg-card border-border rounded-2xl border px-4">
            <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
              Capacity
            </Text>
            <InfoRow
              icon={WarehouseIcon}
              label="Max Stock Units"
              value={location.capacity?.maxStockUnits?.toString()}
            />
            <InfoRow
              icon={FactoryIcon}
              label="Production Capacity"
              value={location.capacity?.productionCapacity?.toString()}
            />
          </View>
        )}
      </ScrollView>

      <EditModal location={location} visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
}
