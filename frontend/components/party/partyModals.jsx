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
  BuildingIcon,
  ShoppingCartIcon,
  ArrowLeftRightIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ModalToast } from '@/components/ui/modalToast';
import { updateParty } from '@/api/party';

const TYPE_CONFIG = {
  buyer: { label: 'Buyer', icon: ShoppingCartIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  supplier: {
    label: 'Supplier',
    icon: BuildingIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  both: {
    label: 'Both',
    icon: ArrowLeftRightIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
};
const PARTY_TYPES = ['buyer', 'supplier', 'both'];

export function EditModal({ party, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (party) {
      setForm({
        name: party.name ?? '',
        type: party.type ?? 'buyer',
        address: party.address ?? '',
        contact:
          party.contact?.length > 0
            ? [{ ...party.contact[0] }]
            : [{ person: '', phone: '', email: '' }],
        gstin: party.gstin ?? '',
        bankingDetails: {
          bankName: party.bankingDetails?.bankName ?? '',
          accountNumber: party.bankingDetails?.accountNumber ?? '',
          ifscCode: party.bankingDetails?.ifscCode ?? '',
        },
      });
    }
  }, [party]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setContactField = (key, val) =>
    setForm((f) => ({ ...f, contact: [{ ...f.contact[0], [key]: val }] }));
  const setBank = (key, val) =>
    setForm((f) => ({ ...f, bankingDetails: { ...f.bankingDetails, [key]: val } }));

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => updateParty(party._id, data),
    meta: { successMessage: 'Party updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['party', party._id] });
      qc.invalidateQueries({ queryKey: ['parties'] });
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
            <Text className="text-foreground text-lg font-bold">Edit Party</Text>
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
                {PARTY_TYPES.map((t) => {
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
                        className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground'}`}
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
                Primary Contact
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Person</Text>
                <Input
                  value={form.contact?.[0]?.person}
                  onChangeText={(v) => setContactField('person', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Phone</Text>
                <Input
                  value={form.contact?.[0]?.phone}
                  onChangeText={(v) => setContactField('phone', v)}
                  keyboardType="phone-pad"
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Email</Text>
                <Input
                  value={form.contact?.[0]?.email}
                  onChangeText={(v) => setContactField('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">GSTIN</Text>
              <Input
                value={form.gstin}
                onChangeText={(v) => set('gstin', v)}
                autoCapitalize="characters"
              />
            </View>
            <View className="gap-y-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Banking Details
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Bank Name</Text>
                <Input
                  value={form.bankingDetails?.bankName}
                  onChangeText={(v) => setBank('bankName', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Account Number</Text>
                <Input
                  value={form.bankingDetails?.accountNumber}
                  onChangeText={(v) => setBank('accountNumber', v)}
                  keyboardType="number-pad"
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">IFSC Code</Text>
                <Input
                  value={form.bankingDetails?.ifscCode}
                  onChangeText={(v) => setBank('ifscCode', v)}
                  autoCapitalize="characters"
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
