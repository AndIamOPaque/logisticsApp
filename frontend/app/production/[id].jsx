import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  Settings,
  Printer,
  Box,
  AlertTriangle,
  ChevronLeftIcon,
  FlaskConicalIcon,
  RotateCcwIcon,
  ClockIcon,
} from 'lucide-react-native';
import ConfirmDialog from '@/components/confirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { fetchProductionById, changeProductionStatus, fetchProductionLogs } from '@/api/production';
import ProductionOutputModal from '@/components/production/productionOutputModal';
import LogMaterialModal from '@/components/production/logMaterialModal';
import InventoryMoveCard from '@/components/production/inventoryMoveCard';

const ProductionManagePage = () => {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [outputModalVisible, setOutputModalVisible] = useState(false);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmConfig, setConfirmConfig] = useState(null);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const {
    data: order,
    isPending,
    error,
  } = useQuery({
    queryKey: ['production', id],
    queryFn: () => fetchProductionById(id),
    staleTime: 1,
  });

  const { data: logs, isPending: logsPending } = useQuery({
    queryKey: ['productionLogs', id],
    queryFn: () => fetchProductionLogs(id),
    // Fetch for both materials (derived summary) and history (raw log view)
    enabled: activeTab === 'history' || activeTab === 'materials',
  });

  // ─── Material summary derived from logs ───────────────────────────────────
  // Groups all RawMaterial moves by item, summing consumed (qty < 0) and
  // returned (qty > 0) separately. Net = consumed - returned.
  const materialSummary = useMemo(() => {
    if (!logs) return [];
    const map = {};
    logs
      .filter((m) => m.itemModel === 'RawMaterial')
      .forEach((m) => {
        const key = m.item?._id ?? String(m.item);
        if (!map[key]) {
          map[key] = { id: key, name: m.item?.name ?? 'Unknown', consumed: 0, returned: 0 };
        }
        if (m.quantity < 0) {
          map[key].consumed += Math.abs(m.quantity);
        } else {
          map[key].returned += m.quantity;
        }
      });
    return Object.values(map).map((e) => ({ ...e, net: e.consumed - e.returned }));
  }, [logs]);

  // ─── Status mutation ──────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (status) => changeProductionStatus(id, { status }),
    meta: { successMessage: 'Order status updated' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production', id] });
      queryClient.invalidateQueries({ queryKey: ['production'] });
    },
  });

  // ─── Confirm dialog helper ────────────────────────────────────────────────
  const askConfirmation = (message, title, variant = 'default') =>
    new Promise((resolve) => setConfirmConfig({ message, title, variant, resolve }));

  const handleCloseOrder = async (status) => {
    const confirmed = await askConfirmation(
      status === 'completed'
        ? 'Completing this order will finalise all stock movements. Proceed?'
        : 'Cancelling this order will move remaining materials to waste. Proceed?',
      status === 'completed' ? 'Complete Order' : 'Cancel Order',
      'destructive'
    );
    if (!confirmed) return;
    mutation.mutate(status);
  };

  // ─── Loading / error states ───────────────────────────────────────────────
  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-y-4 p-6">
        <Icon as={AlertTriangle} className="text-destructive size-12" />
        <Text className="text-foreground text-xl font-bold">Order Not Found</Text>
        <Text className="text-muted-foreground text-center">
          {error?.message ?? 'This production order could not be loaded.'}
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  // ─── Derived values ───────────────────────────────────────────────────────
  const progress =
    order.quantityToProduce > 0 ? (order.quantityProduced / order.quantityToProduce) * 100 : 0;

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isClosed = ['completed', 'cancelled'].includes(order.status?.toLowerCase());

  return (
    <ScrollView
      className="bg-background flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
      {/* ── Back + Header ─────────────────────────────────────────── */}
      <View className="flex-row items-center gap-x-2 px-4 pt-6 pb-2">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
      </View>

      <View className="px-6 pb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Badge variant={getStatusVariant(order.status)} className="mb-2 self-start">
              <Text>{order.status?.toUpperCase() ?? 'UNKNOWN'}</Text>
            </Badge>
            <Text className="text-foreground text-3xl font-black tracking-tight uppercase">
              {order.product?.name ?? 'Unknown Product'}
            </Text>
            <Text className="text-muted-foreground text-lg font-medium">{order.product?.code}</Text>
          </View>

          {/* Status change menu — only when not closed */}
          {!isClosed && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon">
                  <Settings size={24} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {order.status?.toLowerCase() === 'pending' && (
                  <DropdownMenuItem>
                    <TouchableOpacity
                      className="flex-1"
                      onPress={() => mutation.mutate('in_progress')}>
                      <Text>Start Order</Text>
                    </TouchableOpacity>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <TouchableOpacity
                    className="flex-1"
                    onPress={() => handleCloseOrder('completed')}>
                    <Text>Mark Completed</Text>
                  </TouchableOpacity>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TouchableOpacity
                    className="flex-1"
                    onPress={() => handleCloseOrder('cancelled')}>
                    <Text className="text-destructive">Cancel Order</Text>
                  </TouchableOpacity>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </View>
      </View>

      {/* ── Progress Card ──────────────────────────────────────────── */}
      <View className="mb-6 px-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Production Progress</CardTitle>
            <CardDescription>Target: {order.quantityToProduce} Units</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="mb-2 flex-row items-end justify-between">
              <Text className="text-primary text-4xl font-black">{order.quantityProduced}</Text>
              <Text className="text-muted-foreground mb-1 text-sm font-bold">
                {Math.round(progress)}% COMPLETE
              </Text>
            </View>
            <Progress value={progress} className="h-3" />
          </CardContent>
          {!isClosed && (
            <CardFooter className="flex-row gap-3 pt-2">
              <Button className="flex-1" onPress={() => setOutputModalVisible(true)}>
                <Printer size={16} className="text-primary-foreground mr-2" />
                <Text>Log Output</Text>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => setMaterialModalVisible(true)}>
                <Icon as={FlaskConicalIcon} className="text-foreground mr-2 size-4" />
                <Text>Log Material</Text>
              </Button>
            </CardFooter>
          )}
        </Card>
      </View>

      {/* ── Tab Pills ──────────────────────────────────────────────── */}
      <View className="mb-4 px-6">
        <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
          {['overview', 'materials', 'history'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-lg py-2 ${
                activeTab === tab ? 'bg-card shadow-sm' : ''
              }`}>
              <Text
                className={`text-xs font-semibold capitalize ${
                  activeTab === tab ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      <View className="px-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <View className="gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground">Location</Text>
                  <Text className="text-foreground font-medium">
                    {order.location?.name ?? 'N/A'}
                  </Text>
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
                    ₹
                    {(
                      parseFloat(order.product?.salesPrice?.$numberDecimal ?? 0) *
                      order.quantityToProduce
                    ).toFixed(2)}
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* MATERIALS — derived from logs */}
        {activeTab === 'materials' && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <View>
                <CardTitle>Material Consumption</CardTitle>
                <CardDescription>Calculated from inventory move logs</CardDescription>
              </View>
              {!isClosed && (
                <Button size="sm" variant="outline" onPress={() => setMaterialModalVisible(true)}>
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
                  <Text className="text-muted-foreground text-center">
                    No materials logged yet.
                  </Text>
                  {!isClosed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => setMaterialModalVisible(true)}>
                      <Text>Log First Material</Text>
                    </Button>
                  )}
                </View>
              ) : (
                <View>
                  {/* Column headers */}
                  <View className="border-border mb-1 flex-row justify-between border-b pb-2">
                    <Text className="text-muted-foreground flex-1 text-xs font-bold tracking-widest uppercase">
                      Material
                    </Text>
                    <View className="flex-row gap-x-4">
                      <Text className="text-muted-foreground w-14 text-right text-xs font-bold tracking-widest uppercase">
                        Used
                      </Text>
                      <Text className="text-muted-foreground w-14 text-right text-xs font-bold tracking-widest uppercase">
                        Returned
                      </Text>
                      <Text className="text-muted-foreground w-14 text-right text-xs font-bold tracking-widest uppercase">
                        Net
                      </Text>
                    </View>
                  </View>

                  {materialSummary.map((mat) => (
                    <View
                      key={mat.id}
                      className="border-border flex-row items-center justify-between border-b py-3 last:border-0">
                      <View className="mr-2 flex-1">
                        <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
                          {mat.name}
                        </Text>
                        {mat.returned > 0 && (
                          <Text className="text-muted-foreground mt-0.5 text-[10px]">
                            {mat.returned} units returned
                          </Text>
                        )}
                      </View>
                      <View className="flex-row gap-x-4">
                        <Text className="w-14 text-right text-sm font-semibold text-red-500 tabular-nums">
                          {mat.consumed}
                        </Text>
                        <Text
                          className={`w-14 text-right text-sm font-semibold tabular-nums ${
                            mat.returned > 0 ? 'text-green-500' : 'text-muted-foreground'
                          }`}>
                          {mat.returned > 0 ? mat.returned : '—'}
                        </Text>
                        <Text className="text-foreground w-14 text-right text-sm font-bold tabular-nums">
                          {mat.net}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Totals footer */}
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
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
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
        )}
      </View>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <ProductionOutputModal
        order={order}
        visible={outputModalVisible}
        onClose={() => setOutputModalVisible(false)}
      />
      <LogMaterialModal
        orderId={id}
        productId={order.product?._id}
        visible={materialModalVisible}
        onClose={() => setMaterialModalVisible(false)}
      />
      <ConfirmDialog
        visible={!!confirmConfig}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        variant={confirmConfig?.variant}
        onConfirm={() => {
          confirmConfig?.resolve(true);
          setConfirmConfig(null);
        }}
        onCancel={() => {
          confirmConfig?.resolve(false);
          setConfirmConfig(null);
        }}
      />
    </ScrollView>
  );
};

export default ProductionManagePage;
