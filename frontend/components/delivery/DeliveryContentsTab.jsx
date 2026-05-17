import React from 'react';
import { View } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

export default function DeliveryContentsTab({ delivery, getItemName }) {
  const items = delivery.content || [];

  if (items.length === 0) {
    return (
      <View className="bg-card border-b border-border items-center gap-y-2 py-10">
        <Icon as={FileText} className="text-muted-foreground size-8" />
        <Text className="text-muted-foreground text-sm">No items in this delivery.</Text>
      </View>
    );
  }

  return (
    <View className="bg-card border-b border-border">
      {/* Table header */}
      <View className="flex-row justify-between px-4 py-2.5 border-b border-border">
        <Text className="text-muted-foreground flex-1 text-[10px] font-bold tracking-widest uppercase">
          Item
        </Text>
        <Text className="text-muted-foreground w-16 text-right text-[10px] font-bold tracking-widest uppercase">
          Qty
        </Text>
      </View>

      {/* Rows */}
      {items.map((item, i) => (
        <View
          key={i}
          className={`flex-row items-center justify-between px-4 py-3.5 ${i < items.length - 1 ? 'border-b border-border' : ''}`}>
          <View className="mr-2 flex-1">
            <Text className="text-foreground text-sm font-semibold">
              {getItemName(item.itemType, item.itemId)}
            </Text>
            <Text className="text-muted-foreground mt-0.5 text-[10px] uppercase tracking-wider">
              {item.itemType}
            </Text>
          </View>
          <Text className="text-foreground w-16 text-right text-sm font-bold tabular-nums">
            {item.quantity}
          </Text>
        </View>
      ))}

      {/* Total */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-border">
        <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Total Qty
        </Text>
        <Text className="text-foreground font-black">
          {items.reduce((sum, i) => sum + (i.quantity || 0), 0)}
        </Text>
      </View>
    </View>
  );
}
