import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/components/ui/icon';
import { BoxIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function RawMaterialOverviewTab({ material, stockLevels, stockPending, totalStock, onAdjustStock }) {
  return (
    <View className="gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Category</Text>
            <Text className="text-foreground font-medium uppercase">{material.category}</Text>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Unit of Measurement</Text>
            <Text className="text-foreground font-medium uppercase">{material.unitOfMeasurement}</Text>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Cost Per Unit</Text>
            <Text className="text-foreground font-medium">₹{material.costPerUnit?.$numberDecimal}</Text>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Reorder Level / Qty</Text>
            <Text className="text-foreground font-medium">
              {material.reorderLevel} / {material.reorderQuantity}
            </Text>
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <View>
            <CardTitle>Current Stock</CardTitle>
            <CardDescription>Total: {totalStock} units</CardDescription>
          </View>
          <Button size="sm" variant="outline" onPress={onAdjustStock}>
            <Text>Adjust Stock</Text>
          </Button>
        </CardHeader>
        <CardContent>
          {stockPending ? (
            <ActivityIndicator size="small" />
          ) : stockLevels && stockLevels.length > 0 ? (
            stockLevels.map((item) => (
              <View key={item.locationId} className="border-b border-border py-2 last:border-0 flex-row justify-between items-center">
                <View>
                  <Text className="text-foreground font-medium">{item.locationName}</Text>
                </View>
                <Text className={`font-bold ${item.quantity > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {item.quantity}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-muted-foreground text-sm">No stock across locations.</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );
}

export function RawMaterialLogsTab({ logs, logsPending }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Log</CardTitle>
        <CardDescription>Recent movements for this material</CardDescription>
      </CardHeader>
      <CardContent>
        {logsPending ? (
          <ActivityIndicator size="small" />
        ) : logs && logs.length > 0 ? (
          logs.map((log) => (
            <View key={log._id} className="border-b border-border py-3 last:border-0">
              <View className="flex-row justify-between mb-1">
                <Text className="font-semibold text-foreground capitalize">{log.purpose}</Text>
                <Text className={`font-bold ${log.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {log.quantity > 0 ? '+' : ''}{log.quantity}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-xs">{log.location?.name || 'Unknown Location'}</Text>
                <Text className="text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</Text>
              </View>
              <Text className="text-muted-foreground text-[10px] mt-1">Ref: {log.referenceModel} | By: {log.createdBy?.name || 'System'}</Text>
            </View>
          ))
        ) : (
          <Text className="text-muted-foreground text-sm">No recent movements.</Text>
        )}
      </CardContent>
    </Card>
  );
}

export function RawMaterialUsedInTab({ productsUsing, productsPending }) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependencies</CardTitle>
        <CardDescription>Products that require this material</CardDescription>
      </CardHeader>
      <CardContent>
        {productsPending ? (
          <ActivityIndicator size="small" />
        ) : productsUsing && productsUsing.length > 0 ? (
          productsUsing.map((prod) => (
            <TouchableOpacity 
              key={prod._id} 
              className="border-b border-border py-3 last:border-0"
              onPress={() => router.push(`/product/${prod._id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-foreground font-medium">{prod.name}</Text>
                  <Text className="text-muted-foreground text-xs">{prod.code}</Text>
                </View>
                <Icon as={BoxIcon} className="text-muted-foreground size-4" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-muted-foreground text-sm">Not used in any products.</Text>
        )}
      </CardContent>
    </Card>
  );
}
