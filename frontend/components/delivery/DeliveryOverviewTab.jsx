import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import {
  MapPin, User, Truck, Clock,
  ArrowDown, ArrowUp, ArrowLeftRight,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

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

export default function DeliveryOverviewTab({ delivery }) {
  const dir = DIR_CONFIG[delivery.direction] || DIR_CONFIG.out;
  const party = delivery.direction === 'in' ? delivery.supplierId
    : delivery.direction === 'out' ? delivery.buyerId
    : null;

  return (
    <View>
      {/* Logistics Details */}
      <View className="bg-card border-b border-border">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Logistics Details
          </Text>
        </View>
        <View className="px-4">
          <DetailRow icon={MapPin} label="Location" value={delivery.locationId?.name || 'N/A'} />
          {delivery.direction === 'transfer' && delivery.toLocationId && (
            <DetailRow icon={MapPin} label="To Location" value={delivery.toLocationId?.name || 'N/A'} />
          )}
          <DetailRow
            icon={User}
            label={delivery.direction === 'in' ? 'Supplier' : delivery.direction === 'out' ? 'Buyer' : 'Party'}
            value={party?.name || 'N/A'}
          />
          <DetailRow
            icon={User}
            label="Driver"
            valueComponent={
              delivery.driverId ? (
                <TouchableOpacity onPress={() => router.push(`/employee/${delivery.driverId._id}`)}>
                  <Text className="text-primary font-medium">{delivery.driverId.name}</Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-muted-foreground">Unassigned</Text>
              )
            }
          />
          <DetailRow icon={Truck} label="Vehicle" value={delivery.vehicleId?.name || 'Unassigned'} isLast />
        </View>
      </View>

      {/* Timestamps */}
      <View className="bg-card border-b border-border">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Timestamps
          </Text>
        </View>
        <View className="px-4">
          <DetailRow icon={Clock} label="Created" value={new Date(delivery.createdAt).toLocaleString()} />
          <DetailRow
            icon={Clock}
            label="Departure"
            value={delivery.departureTime ? new Date(delivery.departureTime).toLocaleString() : '---'}
          />
          <DetailRow
            icon={Clock}
            label="Arrival"
            value={delivery.arrivalTime ? new Date(delivery.arrivalTime).toLocaleString() : '---'}
            isLast
          />
        </View>
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value, valueComponent, isLast }) {
  return (
    <View className={`flex-row items-center justify-between py-3.5 ${!isLast ? 'border-b border-border' : ''}`}>
      <View className="flex-row items-center gap-x-2">
        <Icon as={icon} className="text-muted-foreground size-4" />
        <Text className="text-muted-foreground text-sm">{label}</Text>
      </View>
      {valueComponent || (
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      )}
    </View>
  );
}
