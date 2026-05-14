import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangleIcon, PackageIcon } from 'lucide-react-native';
import { fetchLowStockAlerts } from '@/api/dashboard';

function AlertRow({ item }) {
  const isCritical = item.totalStock === 0;
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border last:border-0">
      <View className="flex-row items-center gap-x-3 flex-1 mr-3">
        <View className={`p-2 rounded-xl ${isCritical ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
          <Icon
            as={isCritical ? AlertTriangleIcon : PackageIcon}
            className={`size-3.5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}
          />
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-muted-foreground text-xs mt-0.5">
            {item.category} · {item.unit}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className={`text-sm font-bold ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
          {item.totalStock}
        </Text>
        <Text className="text-muted-foreground text-[10px]">
          / {item.reorderLevel} min
        </Text>
      </View>
    </View>
  );
}

export function LowStockWidget() {
  const { data: alerts, isPending, isError } = useQuery({
    queryKey: ['dashboard', 'lowStock'],
    queryFn: fetchLowStockAlerts,
  });

  if (isPending) return null;
  if (isError || !alerts || alerts.length === 0) return null;

  return (
    <View className="bg-card border-b border-border">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
        <View className="flex-row items-center gap-x-2.5">
          <View className="p-2 bg-red-500/10 rounded-xl">
            <Icon as={AlertTriangleIcon} className="size-4 text-red-500" />
          </View>
          <View>
            <Text className="text-foreground text-sm font-bold">Low Stock Alerts</Text>
            <Text className="text-muted-foreground text-xs">
              {alerts.length} material{alerts.length !== 1 ? 's' : ''} below reorder level
            </Text>
          </View>
        </View>
      </View>

      {/* Rows */}
      <View className="px-4">
        {alerts.slice(0, 5).map(item => (
          <AlertRow key={item._id} item={item} />
        ))}
        {alerts.length > 5 && (
          <View className="py-2 items-center">
            <Text className="text-muted-foreground text-xs">+{alerts.length - 5} more</Text>
          </View>
        )}
      </View>
    </View>
  );
}
