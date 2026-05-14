import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  AlertTriangle,
  ChevronLeftIcon,
  MoreVerticalIcon,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
} from 'lucide-react-native';
import ConfirmDialog from '@/components/ui/confirmDialog';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { fetchDeliveryById, changeDeliveryStatus } from '@/api/delivery';
import { fetchProducts } from '@/api/product';
import { fetchRawMaterials } from '@/api/raw-material';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeliveryOverviewTab from '@/components/delivery/DeliveryOverviewTab';
import DeliveryContentsTab from '@/components/delivery/DeliveryContentsTab';
import DeliveryFinanceTab from '@/components/delivery/DeliveryFinanceTab';

const DIR_CONFIG = {
  in:       { label: 'INBOUND',  color: 'text-green-500', bg: 'bg-green-500/10', icon: ArrowDown },
  out:      { label: 'OUTBOUND', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: ArrowUp },
  transfer: { label: 'TRANSFER', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: ArrowLeftRight },
};

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'default';
    case 'pending': return 'secondary';
    case 'cancelled': return 'destructive';
    case 'in-transit': return 'outline';
    default: return 'outline';
  }
};

// Status transition options based on current status
const getAvailableTransitions = (currentStatus) => {
  switch (currentStatus?.toLowerCase()) {
    case 'pending':
      return [
        { label: 'Dispatch (In Transit)', value: 'in-transit', color: 'text-blue-500' },
        { label: 'Cancel Delivery', value: 'cancelled', color: 'text-destructive' },
      ];
    case 'in-transit':
      return [
        { label: 'Mark Delivered', value: 'delivered', color: 'text-green-500' },
        { label: 'Cancel Delivery', value: 'cancelled', color: 'text-destructive' },
      ];
    default:
      return [];
  }
};

export default function DeliveryDetailPage() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Queries
  const { data: delivery, isPending, error } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => fetchDeliveryById(id),
  });

  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const { data: rawMaterialsRes } = useQuery({
    queryKey: ['raw-materials'],
    queryFn: fetchRawMaterials,
  });

  const rawMaterials = rawMaterialsRes?.data || [];

  // Status mutation
  const mutation = useMutation({
    mutationFn: (status) => changeDeliveryStatus(id, status),
    meta: { successMessage: 'Delivery status updated' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      setShowStatusMenu(false);
    },
  });

  const askConfirmation = (message, title, variant = 'default') =>
    new Promise((resolve) => setConfirmConfig({ message, title, variant, resolve }));

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    if (newStatus === 'delivered' || newStatus === 'cancelled') {
      const confirmed = await askConfirmation(
        `Are you sure you want to mark this delivery as ${newStatus.toUpperCase()}? This will affect stock levels.`,
        'Confirm Status Change',
        newStatus === 'cancelled' ? 'destructive' : 'default'
      );
      if (!confirmed) return;
    }
    mutation.mutate(newStatus);
  };

  // Item name resolver for contents tab
  const getItemName = (type, itemId) => {
    if (type === 'Product') {
      const p = products?.find((x) => x._id === itemId);
      return p ? p.name : 'Unknown Product';
    }
    const r = rawMaterials?.find((x) => x._id === itemId);
    return r ? r.name : 'Unknown Material';
  };

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !delivery) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
        <View className="flex-1 items-center justify-center gap-y-4 p-6">
          <Icon as={AlertTriangle} className="text-destructive size-12" />
          <Text className="text-foreground text-xl font-bold">Delivery Not Found</Text>
          <Text className="text-muted-foreground text-center">
            {error?.message ?? 'This delivery could not be loaded.'}
          </Text>
          <Button variant="outline" onPress={() => router.back()}>
            <Text>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const dir = DIR_CONFIG[delivery.direction] || DIR_CONFIG.out;
  const party = delivery.direction === 'in' ? delivery.supplierId
    : delivery.direction === 'out' ? delivery.buyerId : null;
  const isClosed = ['delivered', 'cancelled'].includes(delivery.status?.toLowerCase());
  const transitions = getAvailableTransitions(delivery.status);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-2">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-lg h-8 w-8">
            <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
          </Button>
          <View>
            <Text className="text-foreground text-lg font-bold" numberOfLines={1}>
              {party?.name || 'Delivery'}
            </Text>
            <Text className="text-muted-foreground text-xs">
              #{delivery._id.substring(0, 8)}
            </Text>
          </View>
        </View>

        {/* Status action button */}
        {!isClosed && transitions.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowStatusMenu(!showStatusMenu)}
            className="p-2 rounded-lg">
            <Icon as={MoreVerticalIcon} className="text-foreground size-5" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Menu Dropdown */}
      {showStatusMenu && (
        <View className="bg-card border-b border-border px-4 py-2 gap-y-1">
          {transitions.map(t => (
            <TouchableOpacity
              key={t.value}
              onPress={() => handleStatusChange(t.value)}
              className="py-3 px-3 bg-muted rounded-lg mb-1">
              <Text className={`text-sm font-semibold ${t.color}`}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Status + Direction banner */}
      <View className="bg-card border-b border-border px-4 py-3 flex-row items-center gap-x-2">
        <Badge variant={getStatusVariant(delivery.status)}>
          <Text>{delivery.status?.toUpperCase() ?? 'UNKNOWN'}</Text>
        </Badge>
        <View className={`flex-row items-center gap-x-1 rounded px-2 py-0.5 ${dir.bg}`}>
          <Icon as={dir.icon} className={`size-3 ${dir.color}`} />
          <Text className={`text-xs font-bold ${dir.color}`}>{dir.label}</Text>
        </View>
      </View>

      {/* Tab Pills */}
      <View className="bg-card border-b border-border px-4 py-2">
        <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
          {['overview', 'contents', 'finance'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-lg py-2 ${activeTab === tab ? 'bg-card shadow-sm' : ''}`}>
              <Text
                className={`text-xs font-semibold capitalize ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 55 }}>

        {activeTab === 'overview' && <DeliveryOverviewTab delivery={delivery} />}
        {activeTab === 'contents' && <DeliveryContentsTab delivery={delivery} getItemName={getItemName} />}
        {activeTab === 'finance' && <DeliveryFinanceTab delivery={delivery} />}
      </ScrollView>

      <ConfirmDialog
        visible={!!confirmConfig}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        variant={confirmConfig?.variant}
        onConfirm={() => {
          confirmConfig?.resolve(true);
          setConfirmConfig(null);
        }}
        onCancel={() => {
          confirmConfig?.resolve(false);
          setConfirmConfig(null);
        }}
      />
    </SafeAreaView>
  );
}
