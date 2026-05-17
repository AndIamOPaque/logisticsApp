import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeftIcon, PencilIcon, TruckIcon, MonitorIcon, SofaIcon, CogIcon, TrashIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fetchAssetById, deleteAsset } from '@/api/asset';
import ConfirmDialog from '@/components/ui/confirmDialog';

import { EditModal, ServiceModal } from '@/components/asset/assetModals';
import { AssetHero, AssetDetailsCard, AssetServiceRecords } from '@/components/asset/AssetOverviewTab';

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

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [editVisible, setEditVisible] = React.useState(false);
  const [serviceVisible, setServiceVisible] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAssetById(id),
  });

  const asset = data?.data ?? data;
  const cat = asset ? (CATEGORY_CONFIG[asset.category] ?? CATEGORY_CONFIG.machinery) : null;
  const sts = asset ? (STATUS_CONFIG[asset.status] ?? STATUS_CONFIG.active) : null;

  const deleteMutation = useMutation({
    mutationFn: () => deleteAsset(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      router.back();
    },
  });

  if (isPending)
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <Text className="text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );

  if (isError || !asset)
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center gap-y-3" edges={['top']}>
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
        <View className="flex-row gap-x-2">
          <Button variant="outline" size="icon" onPress={() => setEditVisible(true)} className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
          <Button variant="destructive" size="icon" onPress={() => setDeleteConfirm(true)} className="rounded-xl">
            <Icon as={TrashIcon} className="text-white size-4" />
          </Button>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}>
        
        <View className="py-4">
          <AssetHero cat={cat} sts={sts} />
        </View>
        <AssetDetailsCard asset={asset} />
        <AssetServiceRecords asset={asset} onAddService={() => setServiceVisible(true)} />
        
      </ScrollView>

      <ServiceModal
        assetId={id}
        visible={serviceVisible}
        onClose={() => setServiceVisible(false)}
      />
      <EditModal asset={asset} visible={editVisible} onClose={() => setEditVisible(false)} />
      
      <ConfirmDialog
        visible={deleteConfirm}
        title="Retire Asset"
        message="Are you sure you want to retire this asset? It will be marked as inactive."
        confirmText="Retire"
        variant="destructive"
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteConfirm(false);
        }}
        onCancel={() => setDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}
