import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ModalToast } from '@/components/ui/modalToast';
import { updateAsset, addServiceRecord } from '@/api/asset';
import { fetchLocations } from '@/api/location';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORY_CONFIG = {
  machinery: {
    label: 'Machinery',
    icon: require('lucide-react-native').CogIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  vehicle: {
    label: 'Vehicle',
    icon: require('lucide-react-native').TruckIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  it: {
    label: 'IT',
    icon: require('lucide-react-native').MonitorIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  furniture: {
    label: 'Furniture',
    icon: require('lucide-react-native').SofaIcon,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
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

export function ServiceModal({ assetId, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ description: '', date: new Date() });
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => addServiceRecord(assetId, data),
    meta: { successMessage: 'Service record added' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset', assetId] });
      onClose();
      setForm({ description: '', date: new Date() });
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
              <Text className="text-foreground text-sm font-medium">Date</Text>
              <Button
                variant="outline"
                onPress={() => setShowDatePicker(true)}
                className="justify-start">
                <Text className="text-foreground">
                  {form.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </Button>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={form.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setForm((f) => ({ ...f, date: selectedDate }));
                }}
                maximumDate={new Date()}
              />
            )}
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

export function EditModal({ asset, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});
  const { data: locData } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });

  const rawLocArray = Array.isArray(locData?.data)
    ? locData.data
    : Array.isArray(locData)
      ? locData
      : locData?.data?.docs || [];
  const locationOptions =
    rawLocArray.length === 0 ? [] : rawLocArray.map((l) => ({ label: l.name, value: l._id }));

  React.useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name ?? '',
        category: asset.category ?? 'machinery',
        location: asset.location?._id ?? asset.location ?? '',
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
              <ThemedSelect
                items={locationOptions}
                value={form.location}
                onValueChange={(v) => set('location', v)}
                placeholder="Select location"
              />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Status</Text>
              <ThemedSelect
                items={STATUS_OPTIONS}
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
