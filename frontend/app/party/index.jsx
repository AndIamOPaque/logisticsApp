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
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UsersIcon,
  PlusIcon,
  XIcon,
  ChevronRightIcon,
  BuildingIcon,
  ShoppingCartIcon,
  ArrowLeftRightIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { Sidebar } from '@/components/dashboard/sidebar';
import { fetchParties, createParty } from '@/api/party';

// ─── Config ──────────────────────────────────────────────────────────────────
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

// ─── Party Card ───────────────────────────────────────────────────────────────
function PartyCard({ party, onPress }) {
  const cfg = TYPE_CONFIG[party.type] ?? TYPE_CONFIG.buyer;
  const primaryContact = party.contact?.[0];
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
          {party.name}
        </Text>
        {primaryContact?.phone && (
          <Text className="text-muted-foreground mt-0.5 text-xs">{primaryContact.phone}</Text>
        )}
        <View className="mt-1.5 flex-row gap-x-2">
          <View className={`rounded-full px-2 py-0.5 ${cfg.bg}`}>
            <Text className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</Text>
          </View>
          {party.gstin && (
            <View className="bg-muted rounded-full px-2 py-0.5">
              <Text className="text-muted-foreground text-xs">GST</Text>
            </View>
          )}
        </View>
      </View>
      <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Create Modal ────────────────────────────────────────────────────────────
function CreatePartyModal({ visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({
    name: '',
    type: 'buyer',
    address: '',
    contact: [{ person: '', phone: '', email: '' }],
    gstin: '',
    bankingDetails: { bankName: '', accountNumber: '', ifscCode: '' },
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setContactField = (key, val) =>
    setForm((f) => ({ ...f, contact: [{ ...f.contact[0], [key]: val }] }));
  const setBank = (key, val) =>
    setForm((f) => ({ ...f, bankingDetails: { ...f.bankingDetails, [key]: val } }));

  const { mutate, isPending } = useMutation({
    mutationFn: createParty,
    meta: { successMessage: 'Party created' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parties'] });
      onClose();
      setForm({
        name: '',
        type: 'buyer',
        address: '',
        contact: [{ person: '', phone: '', email: '' }],
        gstin: '',
        bankingDetails: { bankName: '', accountNumber: '', ifscCode: '' },
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
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <Text className="text-foreground text-lg font-bold">New Party</Text>
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
                placeholder="e.g. Sharma Plastics Pvt. Ltd."
                value={form.name}
                onChangeText={(v) => set('name', v)}
              />
            </View>

            {/* Type */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Type *</Text>
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

            {/* Address */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Address</Text>
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
                Primary Contact
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Contact Person</Text>
                <Input
                  placeholder="Name"
                  value={form.contact[0].person}
                  onChangeText={(v) => setContactField('person', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Phone</Text>
                <Input
                  placeholder="+91..."
                  keyboardType="phone-pad"
                  value={form.contact[0].phone}
                  onChangeText={(v) => setContactField('phone', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Email</Text>
                <Input
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.contact[0].email}
                  onChangeText={(v) => setContactField('email', v)}
                />
              </View>
            </View>

            {/* GSTIN */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">GSTIN (optional)</Text>
              <Input
                placeholder="22AAAAA0000A1Z5"
                autoCapitalize="characters"
                value={form.gstin}
                onChangeText={(v) => set('gstin', v)}
              />
            </View>

            {/* Banking */}
            <View className="gap-y-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Banking Details (optional)
              </Text>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Bank Name</Text>
                <Input
                  placeholder="e.g. SBI"
                  value={form.bankingDetails.bankName}
                  onChangeText={(v) => setBank('bankName', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Account Number</Text>
                <Input
                  placeholder="Account number"
                  keyboardType="number-pad"
                  value={form.bankingDetails.accountNumber}
                  onChangeText={(v) => setBank('accountNumber', v)}
                />
              </View>
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">IFSC Code</Text>
                <Input
                  placeholder="SBIN0001234"
                  autoCapitalize="characters"
                  value={form.bankingDetails.ifscCode}
                  onChangeText={(v) => setBank('ifscCode', v)}
                />
              </View>
            </View>
          </ScrollView>

          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button
              onPress={() => mutate(form)}
              disabled={isPending || !form.name.trim()}
              className="w-full">
              <Text>{isPending ? 'Creating...' : 'Create Party'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    <ModalToast />
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function PartyListScreen() {
  const router = useRouter();
  const [createVisible, setCreateVisible] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [filterType, setFilterType] = React.useState(null);
  const tabBarHeight = useBottomTabBarHeight();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['parties'],
    queryFn: fetchParties,
  });

  const allParties = Array.isArray(data) ? data : (data?.data ?? []);
  const parties = filterType
    ? allParties.filter((p) => p.type === filterType || p.type === 'both')
    : allParties;

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
            <Icon as={UsersIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Parties</Text>
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

      {/* Type filter */}
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
        {[null, ...PARTY_TYPES].map((t) => {
          const cfg = t ? TYPE_CONFIG[t] : null;
          const active = filterType === t;
          return (
            <TouchableOpacity
              key={t ?? 'all'}
              onPress={() => setFilterType(t)}
              activeOpacity={0.7}
              className={`flex-row items-center gap-x-1.5 rounded-full border px-3 py-1.5 ${active ? 'bg-primary border-primary' : 'border-border bg-transparent'}`}>
              {cfg && (
                <Icon
                  as={cfg.icon}
                  className={`size-3.5 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                />
              )}
              <Text
                className={`text-xs font-semibold ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {t ? cfg.label : 'All'}
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
            <Text className="text-muted-foreground text-sm">Loading parties…</Text>
          </View>
        )}
        {isError && <ErrorMessage error={{message: 'Could not load parties.'}} onRetry={refetch} />}
        {!isPending && !isError && parties.length === 0 && (
          <View className="items-center gap-y-3 py-16">
            <View className="bg-muted rounded-full p-4">
              <Icon as={UsersIcon} className="text-muted-foreground size-8" />
            </View>
            <Text className="text-muted-foreground text-sm">No parties yet.</Text>
            <Button size="sm" onPress={() => setCreateVisible(true)}>
              <Text>Add First Party</Text>
            </Button>
          </View>
        )}
        {parties.map((p) => (
          <PartyCard key={p._id} party={p} onPress={() => router.push(`/party/${p._id}`)} />
        ))}
      </ScrollView>

      <CreatePartyModal visible={createVisible} onClose={() => setCreateVisible(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
