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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  XIcon,
  FactoryIcon,
  WarehouseIcon,
  BuildingIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ModalToast } from '@/components/ui/modalToast';
import { updateLocation } from '@/api/location';

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

export function EditModal({ location, visible, onClose }) {
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
      <ModalToast />
    </Modal>
  );
}
