import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  MapPinIcon,
  CalendarIcon,
  IndianRupeeIcon,
  ClipboardListIcon,
  PlusIcon,
  WrenchIcon,
} from 'lucide-react-native';

export function AssetHero({ cat, sts }) {
  return (
    <View className="flex-row items-center gap-x-3 px-4">
      <View className={`rounded-2xl p-3 ${cat.bg}`}>
        <Icon as={cat.icon} className={`size-7 ${cat.color}`} />
      </View>
      <View className="flex-row flex-wrap gap-x-2">
        <View className={`rounded-full px-3 py-1 ${cat.bg}`}>
          <Text className={`text-sm font-semibold ${cat.color}`}>{cat.label}</Text>
        </View>
        <View className={`rounded-full px-3 py-1 ${sts.bg}`}>
          <Text className={`text-sm font-semibold ${sts.color}`}>{sts.label}</Text>
        </View>
      </View>
    </View>
  );
}

export function AssetDetailsCard({ asset }) {
  return (
    <View className="bg-card border-border border-b px-4 pb-2">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        Details
      </Text>
      {asset.location?.name && (
        <View className="border-border flex-row items-center gap-x-3 border-b py-3">
          <View className="bg-muted rounded-lg p-1.5">
            <Icon as={MapPinIcon} className="text-muted-foreground size-4" />
          </View>
          <View>
            <Text className="text-muted-foreground text-xs">Location</Text>
            <Text className="text-foreground text-sm font-medium">{asset.location.name}</Text>
          </View>
        </View>
      )}
      {asset.purchaseDate && (
        <View className="border-border flex-row items-center gap-x-3 border-b py-3">
          <View className="bg-muted rounded-lg p-1.5">
            <Icon as={CalendarIcon} className="text-muted-foreground size-4" />
          </View>
          <View>
            <Text className="text-muted-foreground text-xs">Purchase Date</Text>
            <Text className="text-foreground text-sm font-medium">
              {new Date(asset.purchaseDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
      {asset.cost !== undefined && (
        <View className="border-border flex-row items-center gap-x-3 border-b py-3">
          <View className="bg-muted rounded-lg p-1.5">
            <Icon as={IndianRupeeIcon} className="text-muted-foreground size-4" />
          </View>
          <View>
            <Text className="text-muted-foreground text-xs">Cost</Text>
            <Text className="text-foreground text-sm font-medium">
              ₹{asset.cost?.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      )}
      {asset.notes && (
        <View className="flex-row items-start gap-x-3 py-3">
          <View className="bg-muted mt-0.5 rounded-lg p-1.5">
            <Icon as={ClipboardListIcon} className="text-muted-foreground size-4" />
          </View>
          <View className="flex-1">
            <Text className="text-muted-foreground text-xs">Notes</Text>
            <Text className="text-foreground text-sm">{asset.notes}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export function AssetServiceRecords({ asset, onAddService }) {
  return (
    <View className="bg-card border-border border-b px-4 pb-2">
      <View className="flex-row items-center justify-between pt-4 pb-2">
        <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Service Records
        </Text>
        <TouchableOpacity
          onPress={onAddService}
          className="flex-row items-center gap-x-1">
          <Icon as={PlusIcon} className="text-primary size-3.5" />
          <Text className="text-primary text-xs font-semibold">Log</Text>
        </TouchableOpacity>
      </View>
      {!asset.serviceRecords || asset.serviceRecords.length === 0 ? (
        <View className="items-center py-6">
          <Text className="text-muted-foreground text-sm">No service records yet.</Text>
        </View>
      ) : (
        [...asset.serviceRecords].reverse().map((rec, i) => (
          <View key={i} className="border-border border-t py-3">
            <View className="mb-1 flex-row items-center gap-x-2">
              <Icon as={WrenchIcon} className="text-muted-foreground size-3.5" />
              <Text className="text-muted-foreground text-xs">
                {new Date(rec.date).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-foreground text-sm">{rec.description}</Text>
          </View>
        ))
      )}
    </View>
  );
}
