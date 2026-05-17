import * as React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeftIcon, PencilIcon, TrashIcon, ShoppingCartIcon, BuildingIcon, ArrowLeftRightIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fetchPartyById, deleteParty } from '@/api/party';

import { EditModal } from '@/components/party/partyModals';
import { PartyHero, PartyGeneralCard, PartyContactsCard, PartyBankingCard } from '@/components/party/PartyOverviewTab';

const TYPE_CONFIG = {
  buyer: { label: 'Buyer', icon: ShoppingCartIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  supplier: { label: 'Supplier', icon: BuildingIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  both: { label: 'Both', icon: ArrowLeftRightIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

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
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <Text className="text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  
  if (isError || !party)
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center gap-y-3" edges={['top']}>
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
          <Button variant="outline" size="icon" onPress={() => setEditVisible(true)} className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
          <Button variant="destructive" size="icon" onPress={handleDelete} disabled={deleting} className="rounded-xl">
            <Icon as={TrashIcon} className="size-4 text-white" />
          </Button>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="py-5 gap-y-4"
        showsVerticalScrollIndicator={false}>
        
        <PartyHero cfg={cfg} />
        <PartyGeneralCard party={party} />
        <PartyContactsCard party={party} />
        <PartyBankingCard party={party} />

      </ScrollView>

      <EditModal party={party} visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
}
