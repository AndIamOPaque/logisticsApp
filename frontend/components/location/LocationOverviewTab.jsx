import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  FactoryIcon,
  WarehouseIcon,
} from 'lucide-react-native';

export function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View className="border-border flex-row items-start gap-x-3 border-b py-3 last:border-0">
      <View className="bg-muted mt-0.5 rounded-lg p-1.5">
        <Icon as={icon} className="text-muted-foreground size-4" />
      </View>
      <View className="flex-1">
        <Text className="text-muted-foreground mb-0.5 text-xs">{label}</Text>
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

export function LocationHero({ cfg, location }) {
  return (
    <View className="flex-row items-center gap-x-3 px-4">
      <View className={`rounded-2xl p-3 ${cfg.bg}`}>
        <Icon as={cfg.icon} className={`size-7 ${cfg.color}`} />
      </View>
      <View>
        <View className={`rounded-full px-3 py-1 ${cfg.bg} self-start`}>
          <Text className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</Text>
        </View>
        {!location.isActive && (
          <View className="bg-muted mt-1 self-start rounded-full px-3 py-1">
            <Text className="text-muted-foreground text-xs font-medium">Inactive</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function LocationDetailsCard({ location }) {
  return (
    <View className="bg-card border-border mx-4 rounded-2xl border px-4">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        Details
      </Text>
      <InfoRow icon={MapPinIcon} label="Address" value={location.address} />
    </View>
  );
}

export function LocationContactCard({ location }) {
  if (!location.contact?.manager && !location.contact?.phone && !location.contact?.email) {
    return null;
  }
  return (
    <View className="bg-card border-border mx-4 rounded-2xl border px-4">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        Contact
      </Text>
      <InfoRow icon={UserIcon} label="Manager" value={location.contact?.manager} />
      <InfoRow icon={PhoneIcon} label="Phone" value={location.contact?.phone} />
      <InfoRow icon={MailIcon} label="Email" value={location.contact?.email} />
    </View>
  );
}

export function LocationCapacityCard({ location }) {
  if (!location.capacity?.maxStockUnits && !location.capacity?.productionCapacity) {
    return null;
  }
  return (
    <View className="bg-card border-border mx-4 rounded-2xl border px-4">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        Capacity
      </Text>
      <InfoRow
        icon={WarehouseIcon}
        label="Max Stock Units"
        value={location.capacity?.maxStockUnits?.toString()}
      />
      <InfoRow
        icon={FactoryIcon}
        label="Production Capacity"
        value={location.capacity?.productionCapacity?.toString()}
      />
    </View>
  );
}
