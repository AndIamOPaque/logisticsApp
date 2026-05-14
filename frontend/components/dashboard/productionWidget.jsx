import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useQuery } from '@tanstack/react-query';
import { FactoryIcon, ArrowRightIcon, ClockIcon, CheckCircleIcon, CircleDotIcon, XCircleIcon } from 'lucide-react-native';
import { fetchProductions } from '@/api/production';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'text-yellow-500',  bg: 'bg-yellow-500/10', icon: ClockIcon      },
  in_progress: { label: 'In Progress', color: 'text-blue-500',    bg: 'bg-blue-500/10',   icon: CircleDotIcon  },
  completed:   { label: 'Completed',   color: 'text-green-500',   bg: 'bg-green-500/10',  icon: CheckCircleIcon},
  cancelled:   { label: 'Cancelled',   color: 'text-red-500',     bg: 'bg-red-500/10',    icon: XCircleIcon    },
};

function ProgressBar({ value, total }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <View className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
      <View className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
    </View>
  );
}

function OrderRow({ order }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  return (
    <TouchableOpacity
      onPress={() => router.push(`/production/${order._id}`)}
      activeOpacity={0.6}
      className="flex-row items-center justify-between py-3 border-b border-border last:border-0">
      <View className="flex-1 mr-3">
        <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
          {order.product?.name ?? '—'}
        </Text>
        <Text className="text-muted-foreground text-xs mt-0.5">
          {order.location?.name ?? '—'}
        </Text>
        <ProgressBar value={order.quantityProduced} total={order.quantityToProduce} />
        <Text className="text-muted-foreground text-xs mt-1">
          {order.quantityProduced} / {order.quantityToProduce} units
        </Text>
      </View>
      <View className={`px-2.5 py-1 rounded-full ${cfg.bg} flex-row items-center gap-x-1`}>
        <Icon as={cfg.icon} className={`size-3 ${cfg.color}`} />
        <Text className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function ProductionWidget() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['production', 'dashboard'],
    queryFn: () => fetchProductions({ limit: 3 }),
  });

  const orders = data?.data ?? [];
  const activeCount = orders.filter(o => o.status === 'in_progress').length;

  return (
    <View className="bg-card border-b border-border">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
        <View className="flex-row items-center gap-x-2.5">
          <View className="p-2 bg-blue-500/10 rounded-xl">
            <Icon as={FactoryIcon} className="size-4 text-blue-500" />
          </View>
          <View>
            <Text className="text-foreground text-sm font-bold">Production</Text>
            <Text className="text-muted-foreground text-xs">
              {activeCount} order{activeCount !== 1 ? 's' : ''} running
            </Text>
          </View>
        </View>
        <Link href="/production" asChild>
          <TouchableOpacity className="flex-row items-center gap-x-1" activeOpacity={0.6}>
            <Text className="text-primary text-xs font-semibold">View all</Text>
            <Icon as={ArrowRightIcon} className="size-3 text-primary" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Content */}
      <View className="px-4">
        {isPending && (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground text-sm">Loading orders…</Text>
          </View>
        )}
        {isError && (
          <View className="py-8 items-center">
            <Text className="text-red-500 text-sm">Could not load production orders.</Text>
          </View>
        )}
        {!isPending && !isError && orders.length === 0 && (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground text-sm">No production orders yet.</Text>
          </View>
        )}
        {!isPending && orders.map(order => (
          <OrderRow key={order._id} order={order} />
        ))}
      </View>
    </View>
  );
}