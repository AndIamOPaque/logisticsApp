import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useQuery } from '@tanstack/react-query';
import {
  TruckIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CircleIcon,
  CircleDotIcon,
  CheckCircleIcon,
} from 'lucide-react-native';
import { fetchDeliveries } from '@/api/delivery';

const STATUS_CFG = {
  pending:     { label: 'Pending',    color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: CircleIcon    },
  'in-transit':{ label: 'In Transit', color: 'text-blue-500',   bg: 'bg-blue-500/10',   icon: CircleDotIcon },
  delivered:   { label: 'Delivered',  color: 'text-green-500',  bg: 'bg-green-500/10',  icon: CheckCircleIcon},
  cancelled:   { label: 'Cancelled',  color: 'text-red-500',    bg: 'bg-red-500/10',    icon: CircleIcon    },
};

function DeliveryRow({ delivery }) {
  const cfg = STATUS_CFG[delivery.status] ?? STATUS_CFG.pending;
  const isInbound = delivery.direction === 'in';
  const partyName = isInbound
    ? delivery.supplierId?.name
    : delivery.buyerId?.name;
  const totalItems = delivery.content.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/delivery/${delivery._id}`)}
      activeOpacity={0.6}
      className="flex-row items-center justify-between py-3 border-b border-border last:border-0">
      <View className="flex-row items-center gap-x-3 flex-1 mr-3">
        <View className={`p-2 rounded-xl ${isInbound ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
          <Icon
            as={isInbound ? ArrowDownIcon : ArrowUpIcon}
            className={`size-3.5 ${isInbound ? 'text-green-500' : 'text-orange-500'}`}
          />
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
            {partyName ?? '—'}
          </Text>
          <Text className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
            {delivery.locationId?.name ?? '—'} · {totalItems} items
          </Text>
        </View>
      </View>
      <View className={`px-2.5 py-1 rounded-full ${cfg.bg} flex-row items-center gap-x-1`}>
        <Icon as={cfg.icon} className={`size-3 ${cfg.color}`} />
        <Text className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SummaryPill({ label, value, color }) {
  return (
    <View className="flex-1 items-center py-2.5 bg-muted rounded-xl">
      <Text className={`text-base font-bold ${color}`}>{value}</Text>
      <Text className="text-muted-foreground text-xs mt-0.5">{label}</Text>
    </View>
  );
}

export function DeliveriesWidget() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['deliveries', 'dashboard'],
    queryFn: () => fetchDeliveries({ limit: 4 }),
  });

  const deliveries = data?.deliveries ?? [];
  const inTransitCount = deliveries.filter(d => d.status === 'in-transit').length;
  const pendingCount   = deliveries.filter(d => d.status === 'pending').length;
  const deliveredToday = deliveries.filter(d => d.status === 'delivered').length;

  return (
    <View className="bg-card border-b border-border">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
        <View className="flex-row items-center gap-x-2.5">
          <View className="p-2 bg-orange-500/10 rounded-xl">
            <Icon as={TruckIcon} className="size-4 text-orange-500" />
          </View>
          <View>
            <Text className="text-foreground text-sm font-bold">Deliveries</Text>
            <Text className="text-muted-foreground text-xs">
              {inTransitCount} in transit
            </Text>
          </View>
        </View>
        <Link href="/delivery" asChild>
          <TouchableOpacity className="flex-row items-center gap-x-1" activeOpacity={0.6}>
            <Text className="text-primary text-xs font-semibold">View all</Text>
            <Icon as={ArrowRightIcon} className="size-3 text-primary" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Summary row */}
      <View className="flex-row gap-x-2 px-4 py-3 border-b border-border">
        <SummaryPill label="In Transit" value={inTransitCount} color="text-blue-500"   />
        <SummaryPill label="Pending"    value={pendingCount}   color="text-yellow-500" />
        <SummaryPill label="Delivered"  value={deliveredToday} color="text-green-500"  />
      </View>

      {/* Delivery rows */}
      <View className="px-4">
        {isPending && (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground text-sm">Loading deliveries…</Text>
          </View>
        )}
        {isError && (
          <View className="py-8 items-center">
            <Text className="text-red-500 text-sm">Could not load deliveries.</Text>
          </View>
        )}
        {!isPending && !isError && deliveries.length === 0 && (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground text-sm">No active deliveries.</Text>
          </View>
        )}
        {!isPending && deliveries.map(d => (
          <DeliveryRow key={d._id} delivery={d} />
        ))}
      </View>
    </View>
  );
}