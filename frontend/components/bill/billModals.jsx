import * as React from 'react';
import {
  View,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon, LinkIcon, CheckIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ModalToast } from '@/components/ui/modalToast';
import { updateBill } from '@/api/bill';
import { fetchDeliveries } from '@/api/delivery';
import DeliveryCard from '@/components/delivery/deliveryCard';

// ─── Edit Bill Modal ──────────────────────────────────────────────────────────
export function EditBillModal({ bill, visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (bill) {
      setForm({
        category: bill.category ?? '',
        paymentMethod: bill.paymentMethod ?? 'CASH',
        notes: bill.notes ?? '',
      });
    }
  }, [bill]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'OTHER'];

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => updateBill(bill._id, data),
    meta: { successMessage: 'Bill updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bill', bill._id] });
      qc.invalidateQueries({ queryKey: ['bills'] });
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
            <Text className="text-foreground text-lg font-bold">Edit Bill</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>
          <ScrollView
            className="flex-1 px-4"
            contentContainerClassName="py-5 gap-y-5"
            keyboardShouldPersistTaps="handled">
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Category</Text>
              <Input value={form.category} onChangeText={(v) => set('category', v)} />
            </View>
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Payment Method</Text>
              <View className="flex-row flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const active = form.paymentMethod === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => set('paymentMethod', m)}
                      activeOpacity={0.7}
                      className={`rounded-xl border px-3 py-2 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {m.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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

// ─── Link Delivery Modal ──────────────────────────────────────────────────────
export function LinkDeliveryModal({ bill, visible, onClose }) {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState(null);
  const [directionFilter, setDirectionFilter] = React.useState(null);

  const STATUSES = ['pending', 'in-transit', 'delivered', 'cancelled'];
  const DIRECTIONS = ['in', 'out', 'transfer'];

  const queryParams = React.useMemo(() => ({
    status: statusFilter || undefined,
    direction: directionFilter || undefined,
    limit: 30,
  }), [statusFilter, directionFilter]);

  const { data, isPending } = useQuery({
    queryKey: ['deliveries', queryParams],
    queryFn: () => fetchDeliveries(queryParams),
    enabled: visible,
  });

  // fetchDeliveries returns { deliveries: [], pagination: {} }
  const deliveries = Array.isArray(data?.deliveries) ? data.deliveries : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));

  const { mutate, isPending: linking } = useMutation({
    mutationFn: (deliveryId) =>
      updateBill(bill._id, { linkedDelivery: deliveryId }),
    meta: { successMessage: 'Delivery linked successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bill', bill._id] });
      onClose();
    },
  });

  const handleUnlink = () => {
    mutate(null);
  };

  const currentLinkedId = bill?.linkedDelivery?._id ?? bill?.linkedDelivery;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
        {/* Header */}
        <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
          <Text className="text-foreground text-lg font-bold">Link to Delivery</Text>
          <Button variant="ghost" size="icon" onPress={onClose}>
            <Icon as={XIcon} className="text-muted-foreground size-5" />
          </Button>
        </View>

        {/* Filter chips - direction */}
        <View style={{ height: 46 }} className="border-border bg-card border-b">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center', height: 46 }}>
            <TouchableOpacity
              onPress={() => setDirectionFilter(null)}
              className={`rounded-full border px-3 py-1.5 ${!directionFilter ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
              <Text className={`text-xs font-semibold ${!directionFilter ? 'text-primary-foreground' : 'text-muted-foreground'}`}>All</Text>
            </TouchableOpacity>
            {DIRECTIONS.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDirectionFilter(directionFilter === d ? null : d)}
                className={`rounded-full border px-3 py-1.5 ${directionFilter === d ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
                <Text className={`text-xs font-semibold capitalize ${directionFilter === d ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{d}</Text>
              </TouchableOpacity>
            ))}

            <View className="w-[1px] h-4 bg-border mx-1" />

            {STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`rounded-full border px-3 py-1.5 ${statusFilter === s ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
                <Text className={`text-xs font-semibold capitalize ${statusFilter === s ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Currently linked */}
        {currentLinkedId && (
          <View className="border-border border-b bg-blue-500/5 px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-2">
              <Icon as={LinkIcon} className="text-blue-500 size-4" />
              <View>
                <Text className="text-blue-500 text-sm font-bold">Currently Linked</Text>
                <Text className="text-blue-500/70 text-xs">#{currentLinkedId.toString().substring(0, 8)}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleUnlink}
              disabled={linking}
              className="bg-red-500/10 rounded-full px-3 py-1">
              <Text className="text-red-500 text-xs font-semibold">Unlink</Text>
            </TouchableOpacity>
          </View>
        )}

        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {deliveries.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-muted-foreground text-sm">No deliveries found.</Text>
              </View>
            ) : (
              deliveries.map((d) => {
                const isLinked = d._id === currentLinkedId;
                return (
                  <TouchableOpacity
                    key={d._id}
                    onPress={() => !isLinked && mutate(d._id)}
                    disabled={linking || isLinked}
                    activeOpacity={0.7}
                    className={`border-b border-border ${isLinked ? 'bg-blue-500/5' : ''}`}>
                    <View pointerEvents="none">
                      <DeliveryCard delivery={d} />
                    </View>
                    {isLinked && (
                      <View className="absolute right-4 top-4 bg-blue-500/10 rounded-full p-1.5">
                        <Icon as={CheckIcon} className="text-blue-500 size-4" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      <ModalToast />
    </Modal>
  );
}
