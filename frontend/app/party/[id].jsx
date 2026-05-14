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
  TrashIcon,
  XIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  MapPinIcon,
  BuildingIcon,
  ShoppingCartIcon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  HashIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { fetchPartyById, updateParty, deleteParty } from '@/api/party';

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

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ party, visible, onClose }) {
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function PartyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [editVisible, setEditVisible] = React.useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ['party', id],
    queryFn: () => fetchPartyById(id),
  });

  const party = data?.data ?? data;
  const cfg = party ? (TYPE_CONFIG[party.type] ?? TYPE_CONFIG.buyer) : null;

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deleteParty(id),
    meta: { successMessage: 'Party deleted' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parties'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Party',
      `Are you sure you want to delete "${party?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove() },
      ]
    );
  };

  if (isPending)
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background items-center justify-center"
        edges={['top']}>
        <Text className="text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  if (isError || !party)
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background items-center justify-center gap-y-3"
        edges={['top']}>
        <Text className="text-red-500">Could not load party.</Text>
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
          {party.name}
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
            disabled={deleting}
            className="rounded-xl">
            <Icon as={TrashIcon} className="size-4 text-white" />
          </Button>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-5 gap-y-4"
        showsVerticalScrollIndicator={false}>
        {/* Type badge */}
        <View className="flex-row items-center gap-x-3">
          <View className={`rounded-2xl p-3 ${cfg.bg}`}>
            <Icon as={cfg.icon} className={`size-7 ${cfg.color}`} />
          </View>
          <View className={`rounded-full px-3 py-1 ${cfg.bg} self-start`}>
            <Text className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</Text>
          </View>
        </View>

        {/* General info */}
        <View className="bg-card border-border rounded-2xl border px-4">
          <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
            General
          </Text>
          <InfoRow icon={MapPinIcon} label="Address" value={party.address} />
          <InfoRow icon={HashIcon} label="GSTIN" value={party.gstin} />
        </View>

        {/* Contacts */}
        {party.contact?.length > 0 && (
          <View className="bg-card border-border rounded-2xl border px-4">
            <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
              Contacts
            </Text>
            {party.contact.map((c, i) => (
              <View key={i} className="border-border border-b py-3 last:border-0">
                {c.person && (
                  <Text className="text-foreground mb-1 text-sm font-semibold">{c.person}</Text>
                )}
                <InfoRow icon={PhoneIcon} label="Phone" value={c.phone} />
                <InfoRow icon={MailIcon} label="Email" value={c.email} />
              </View>
            ))}
          </View>
        )}

        {/* Banking */}
        {(party.bankingDetails?.bankName || party.bankingDetails?.accountNumber) && (
          <View className="bg-card border-border rounded-2xl border px-4">
            <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
              Banking Details
            </Text>
            <InfoRow icon={BuildingIcon} label="Bank" value={party.bankingDetails?.bankName} />
            <InfoRow
              icon={CreditCardIcon}
              label="Account Number"
              value={party.bankingDetails?.accountNumber}
            />
            <InfoRow icon={HashIcon} label="IFSC Code" value={party.bankingDetails?.ifscCode} />
          </View>
        )}
      </ScrollView>

      <EditModal party={party} visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
}
