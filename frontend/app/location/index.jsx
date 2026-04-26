import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPinIcon,
  PlusIcon,
  XIcon,
  FactoryIcon,
  WarehouseIcon,
  BuildingIcon,
  ChevronRightIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { fetchLocations, createLocation } from '@/api/location';

// ─── Type config ─────────────────────────────────────────────────────────────
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

// ─── Location card ───────────────────────────────────────────────────────────
function LocationCard({ location, onPress }) {
  const cfg = TYPE_CONFIG[location.type] ?? TYPE_CONFIG.factory;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-card border-border flex-row items-center gap-x-3 rounded-2xl border px-4 py-4">
      <View className={`rounded-xl p-2.5 ${cfg.bg}`}>
        <Icon as={cfg.icon} className={`size-5 ${cfg.color}`} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
          {location.name}
        </Text>
        <Text className="text-muted-foreground mt-0.5 text-xs" numberOfLines={1}>
          {location.address}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-x-2">
          <View className={`rounded-full px-2 py-0.5 ${cfg.bg}`}>
            <Text className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</Text>
          </View>
          {!location.isActive && (
            <View className="bg-muted rounded-full px-2 py-0.5">
              <Text className="text-muted-foreground text-xs">Inactive</Text>
            </View>
          )}
        </View>
      </View>
      <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
    </TouchableOpacity>
  );
}

// ─── Create Modal ────────────────────────────────────────────────────────────
const LOCATION_TYPES = ['factory', 'warehouse', 'office'];

function CreateLocationModal({ visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({
    name: '',
    type: 'factory',
    address: '',
    contact: { manager: '', phone: '', email: '' },
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setContact = (key, val) =>
    setForm((f) => ({ ...f, contact: { ...f.contact, [key]: val } }));

  const { mutate, isPending } = useMutation({
    mutationFn: createLocation,
    meta: { successMessage: 'Location created successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      onClose();
      setForm({
        name: '',
        type: 'factory',
        address: '',
        contact: { manager: '', phone: '', email: '' },
      });
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
            <Text className="text-foreground text-lg font-bold">New Location</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          <ScrollView
            className="flex-1 px-4"
            contentContainerClassName="py-5 gap-y-5"
            keyboardShouldPersistTaps="handled">
            {/* Name */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Name *</Text>
              <Input
                placeholder="e.g. Main Factory"
                value={form.name}
                onChangeText={(v) => set('name', v)}
              />
            </View>

            {/* Type selector */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Type *</Text>
              <View className="flex-row gap-x-2">
                {LOCATION_TYPES.map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  const active = form.type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => set('type', t)}
                      className={`flex-1 items-center gap-y-1 rounded-xl border py-3 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <Icon
                        as={cfg.icon}
                        className={`size-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <Text
                        className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {cfg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Address */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Address *</Text>
              <Input
                placeholder="Full address"
                value={form.address}
                onChangeText={(v) => set('address', v)}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Contact */}
            <View className="gap-y-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Contact (optional)
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Manager Name</Text>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={form.contact.manager}
                  onChangeText={(v) => setContact('manager', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Phone</Text>
                <Input
                  placeholder="+91..."
                  keyboardType="phone-pad"
                  value={form.contact.phone}
                  onChangeText={(v) => setContact('phone', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Email</Text>
                <Input
                  placeholder="manager@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.contact.email}
                  onChangeText={(v) => setContact('email', v)}
                />
              </View>
            </View>
          </ScrollView>

          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button
              onPress={() => mutate(form)}
              disabled={isPending || !form.name.trim() || !form.address.trim()}
              className="w-full">
              <Text>{isPending ? 'Creating...' : 'Create Location'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function LocationListScreen() {
  const router = useRouter();
  const [createVisible, setCreateVisible] = React.useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  const locations = data?.data ?? [];

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-2">
          <Icon as={MapPinIcon} className="text-foreground size-5" />
          <Text className="text-foreground text-lg font-bold">Locations</Text>
        </View>
        <Button
          size="sm"
          onPress={() => setCreateVisible(true)}
          className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">Add</Text>
        </Button>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-y-3"
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isPending}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
        {isPending && (
          <View className="items-center gap-y-2 py-16">
            <Text className="text-muted-foreground text-sm">Loading locations…</Text>
          </View>
        )}
        {isError && (
          <View className="items-center gap-y-3 py-16">
            <Text className="text-sm text-red-500">Could not load locations.</Text>
            <Button variant="outline" size="sm" onPress={refetch}>
              <Text>Retry</Text>
            </Button>
          </View>
        )}
        {!isPending && !isError && locations.length === 0 && (
          <View className="items-center gap-y-3 py-16">
            <View className="bg-muted rounded-full p-4">
              <Icon as={MapPinIcon} className="text-muted-foreground size-8" />
            </View>
            <Text className="text-muted-foreground text-sm">No locations yet.</Text>
            <Button size="sm" onPress={() => setCreateVisible(true)}>
              <Text>Add First Location</Text>
            </Button>
          </View>
        )}
        {locations.map((loc) => (
          <LocationCard
            key={loc._id}
            location={loc}
            onPress={() => router.push(`/location/${loc._id}`)}
          />
        ))}
      </ScrollView>

      <CreateLocationModal visible={createVisible} onClose={() => setCreateVisible(false)} />
    </SafeAreaView>
  );
}
