import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function ProductOverviewTab({ product, stockLevels, stockPending, totalStock, onAdjustStock }) {
  return (
    <View className="gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Unit</Text>
            <Text className="text-foreground font-medium uppercase">{product.unit}</Text>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Cost Per Unit</Text>
            <Text className="text-foreground font-medium">₹{product.costPerUnit?.$numberDecimal}</Text>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Sales Price</Text>
            <Text className="text-foreground font-medium">₹{product.salesPrice?.$numberDecimal}</Text>
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

export function ProductLogsTab({ logs, logsPending }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Log</CardTitle>
        <CardDescription>Recent movements for this product</CardDescription>
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

export function ProductRecipeTab({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe</CardTitle>
        <CardDescription>Required Raw Materials</CardDescription>
      </CardHeader>
      <CardContent>
        {product.rawMaterials && product.rawMaterials.length > 0 ? (
          product.rawMaterials.map((rm) => (
            <View key={rm._id} className="border-b border-border py-2 last:border-0 flex-row justify-between items-center">
              <View>
                <Text className="text-foreground font-medium">{rm.material?.name || 'Unknown Material'}</Text>
                <Text className="text-muted-foreground text-xs">{rm.material?.code || ''}</Text>
              </View>
              <Text className="text-foreground font-bold">{rm.quantity}</Text>
            </View>
          ))
        ) : (
          <Text className="text-muted-foreground text-sm">No raw materials specified.</Text>
        )}
      </CardContent>
    </Card>
  );
}
