import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Box, ClockIcon, FlaskConicalIcon } from 'lucide-react-native';
import InventoryMoveCard from '@/components/production/inventoryMoveCard';

// ─── Overview Tab ─────────────────────────────────────────────────────────────
export function ProductionOverviewTab({ order }) {
  return (
    <View className="gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Location</Text>
            <Text className="text-foreground font-medium">{order.location?.name ?? 'N/A'}</Text>
          </View>
          <Separator />
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Order ID</Text>
            <Text className="text-foreground bg-muted rounded px-2 py-1 font-mono text-xs">
              {order._id}
            </Text>
          </View>
          <Separator />
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Created By</Text>
            <View className="flex-row items-center gap-2">
              <Avatar alt="User" className="h-6 w-6">
                <AvatarFallback>
                  <Text>{order.createdBy?.name?.[0] ?? 'U'}</Text>
                </AvatarFallback>
              </Avatar>
              <Text className="text-foreground font-medium">
                {order.createdBy?.name ?? 'System'}
              </Text>
            </View>
          </View>
          {order.notes && (
            <>
              <Separator />
              <View className="gap-1">
                <Text className="text-muted-foreground mb-1">Notes</Text>
                <View className="bg-muted/50 rounded-md p-3">
                  <Text className="text-foreground text-sm italic">{order.notes}</Text>
                </View>
              </View>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="flex-row justify-between">
          <View>
            <Text className="text-muted-foreground text-xs uppercase">Est. Cost/Unit</Text>
            <Text className="text-lg font-bold">
              ₹{order.product?.costPerUnit?.$numberDecimal ?? '0.00'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-muted-foreground text-xs uppercase">Target Value</Text>
            <Text className="text-primary text-lg font-bold">
              ₹{(parseFloat(order.product?.salesPrice?.$numberDecimal ?? 0) * order.quantityToProduce).toFixed(2)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

// ─── Materials Tab ─────────────────────────────────────────────────────────────
export function ProductionMaterialsTab({ materialSummary, logsPending, isClosed, onLogMaterial }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <View>
          <CardTitle>Material Consumption</CardTitle>
          <CardDescription>Calculated from inventory move logs</CardDescription>
        </View>
        {!isClosed && (
          <Button size="sm" variant="outline" onPress={onLogMaterial}>
            <Text>+ Log</Text>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {logsPending ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" />
          </View>
        ) : materialSummary.length === 0 ? (
          <View className="items-center gap-y-2 py-8">
            <Icon as={Box} className="text-muted-foreground size-8" />
            <Text className="text-muted-foreground text-center">No materials logged yet.</Text>
            {!isClosed && (
              <Button size="sm" variant="outline" onPress={onLogMaterial}>
                <Text>Log First Material</Text>
              </Button>
            )}
          </View>
        ) : (
          <View>
            <View className="border-border mb-1 flex-row justify-between border-b pb-2">
              <Text className="text-muted-foreground flex-1 text-xs font-bold tracking-widest uppercase">
                Material
              </Text>
              <View className="flex-row gap-x-4">
                <Text className="text-muted-foreground w-14 text-right text-xs font-bold tracking-widest uppercase">Used</Text>
                <Text className="text-muted-foreground w-14 text-right text-xs font-bold tracking-widest uppercase">Ret.</Text>
                <Text className="text-muted-foreground w-14 text-right text-xs font-bold tracking-widest uppercase">Net</Text>
              </View>
            </View>
            {materialSummary.map((mat) => (
              <View key={mat.id} className="border-border flex-row items-center justify-between border-b py-3 last:border-0">
                <View className="mr-2 flex-1">
                  <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>{mat.name}</Text>
                  {mat.returned > 0 && (
                    <Text className="text-muted-foreground mt-0.5 text-[10px]">{mat.returned} units returned</Text>
                  )}
                </View>
                <View className="flex-row gap-x-4">
                  <Text className="w-14 text-right text-sm font-semibold text-red-500 tabular-nums">{mat.consumed}</Text>
                  <Text className={`w-14 text-right text-sm font-semibold tabular-nums ${mat.returned > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {mat.returned > 0 ? mat.returned : '—'}
                  </Text>
                  <Text className="text-foreground w-14 text-right text-sm font-bold tabular-nums">{mat.net}</Text>
                </View>
              </View>
            ))}
            <View className="mt-1 flex-row items-center justify-between pt-3">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                {materialSummary.length} material{materialSummary.length !== 1 ? 's' : ''}
              </Text>
              <Text className="text-foreground text-xs font-bold">
                Total net:{' '}
                <Text className="text-primary">
                  {materialSummary.reduce((s, m) => s + m.net, 0)} units
                </Text>
              </Text>
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

// ─── History Tab ───────────────────────────────────────────────────────────────
export function ProductionHistoryTab({ order, logs, logsPending }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Move Log</CardTitle>
        <CardDescription>All stock movements for this order</CardDescription>
      </CardHeader>
      <CardContent>
        <View className="border-border flex-row gap-3 border-b pb-3">
          <Icon as={ClockIcon} className="text-muted-foreground mt-1 size-4" />
          <View>
            <Text className="text-sm font-medium">Order Created</Text>
            <Text className="text-muted-foreground text-xs">
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
        {logsPending ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" />
          </View>
        ) : !logs || logs.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-sm">No inventory moves yet.</Text>
          </View>
        ) : (
          logs.map((move, i) => <InventoryMoveCard key={move._id ?? i} move={move} />)
        )}
      </CardContent>
    </Card>
  );
}
