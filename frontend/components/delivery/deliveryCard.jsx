import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  Truck,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  MapPin,
  User,
  FileText,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

const DIR_CONFIG = {
  in: { label: 'Inbound', color: 'text-green-500', bg: 'bg-green-500/10', icon: ArrowDown },
  out: { label: 'Outbound', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: ArrowUp },
  transfer: {
    label: 'Transfer',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    icon: ArrowLeftRight,
  },
};

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'in-transit':
      return 'outline';
    default:
      return 'outline';
  }
};

const truncate = (str, len) => str?.length > len ? str.substring(0, len) + '...' : str;

export default function DeliveryCard({ delivery, onPress }) {
  const dir = DIR_CONFIG[delivery.direction] || DIR_CONFIG.out;

  // Party name: inbound → supplier, outbound → buyer, transfer → no party
  const partyName =
    delivery.direction === 'in'
      ? delivery.supplierId?.name
      : delivery.direction === 'out'
        ? delivery.buyerId?.name
        : null;

  const totalItems = delivery.content?.reduce((sum, c) => sum + (c.quantity || 0), 0) || 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-card border-border border-b px-4 py-4">
      {/* Top row: direction + status */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-2">
          <View className={`rounded-xl p-2 ${dir.bg}`}>
            <Icon as={dir.icon} className={`size-4 ${dir.color}`} />
          </View>
          <View>
            <Text className="text-foreground font-semibold">{dir.label}</Text>
            <Text className="text-muted-foreground text-[10px] tracking-widest uppercase">
              {delivery._id.substring(0, 8)}
            </Text>
          </View>
        </View>
        <Badge variant={getStatusVariant(delivery.status)}>
          <Text>{delivery.status?.toUpperCase() || 'UNKNOWN'}</Text>
        </Badge>
      </View>

      {/* Details row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-x-1.5">
          <Icon as={MapPin} className="text-muted-foreground size-3" />
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {truncate(delivery.locationId?.name || 'Unknown', 14)}
          </Text>
        </View>
        {delivery.direction === 'transfer' ? (
          <View className="flex-row items-center gap-x-1.5">
            <Icon as={MapPin} className="text-muted-foreground size-3" />
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {truncate(delivery.toLocationId?.name || 'Unknown', 14)}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-x-1.5">
            <Icon as={User} className="text-muted-foreground size-3" />
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {truncate(partyName || 'No party', 14)}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-row items-center gap-x-1.5">
          <Icon as={FileText} className="text-muted-foreground size-3" />
          <Text className="text-muted-foreground text-xs">{totalItems} qty</Text>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-muted-foreground text-[10px]">
          {new Date(delivery.createdAt).toLocaleDateString()}
        </Text>
        {delivery.driverId && (
          <View className="bg-primary/10 flex-row items-center gap-x-1 rounded-md px-2 py-0.5">
            <Icon as={Truck} className="text-primary size-3" />
            <Text className="text-primary text-[10px] font-semibold">Driver</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
