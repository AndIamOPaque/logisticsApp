import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CreditCard, FileText } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

export default function DeliveryFinanceTab({ delivery }) {
  return (
    <View>
      {/* Trip Finances */}
      <View className="bg-card border-b border-border">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Trip Finances
          </Text>
        </View>
        <View className="px-4">
          <View className="flex-row items-center justify-between py-3.5 border-b border-border">
            <View className="flex-row items-center gap-x-2">
              <Icon as={CreditCard} className="text-muted-foreground size-4" />
              <Text className="text-muted-foreground text-sm">Trip Cost</Text>
            </View>
            <Text className="text-primary text-lg font-black">₹{delivery.tripCost || 0}</Text>
          </View>
          <View className="flex-row items-center justify-between py-3.5">
            <Text className="text-muted-foreground text-sm">Driver Paid?</Text>
            <Badge variant={delivery.isDriverPaid ? 'default' : 'secondary'}>
              <Text>{delivery.isDriverPaid ? 'PAID' : 'UNPAID'}</Text>
            </Badge>
          </View>
        </View>
      </View>

      {/* Linked Bills */}
      <View className="bg-card border-b border-border">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Linked Bills
          </Text>
        </View>
        <View className="px-4">
          {delivery.billIds?.length > 0 ? (
            delivery.billIds.map((bill, i) => (
              <TouchableOpacity
                key={i}
                className={`flex-row items-center justify-between py-3.5 ${i < delivery.billIds.length - 1 ? 'border-b border-border' : ''}`}
                onPress={() => router.push(`/bill/${bill._id || bill}`)}>
                <View className="flex-row items-center gap-x-2">
                  <Icon as={FileText} className="text-primary size-4" />
                  <Text className="text-foreground text-sm font-semibold">
                    Bill #{(bill._id || bill).substring(0, 6)}
                  </Text>
                </View>
                <Text className="text-primary text-xs font-medium">View →</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-6">
              <Text className="text-muted-foreground text-sm">No bills attached.</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
