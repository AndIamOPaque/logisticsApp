import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Printer,
  AlertTriangle,
  ChevronLeftIcon,
  FlaskConicalIcon,
} from 'lucide-react-native';
import ConfirmDialog from '@/components/ui/confirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon';
import { fetchProductionById, changeProductionStatus, fetchProductionLogs } from '@/api/production';
import ProductionOutputModal from '@/components/production/productionOutputModal';
import LogMaterialModal from '@/components/production/logMaterialModal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductionOverviewTab, ProductionMaterialsTab, ProductionHistoryTab } from '@/components/production/productionTabs';

const ProductionManagePage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [outputModalVisible, setOutputModalVisible] = useState(false);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmConfig, setConfirmConfig] = useState(null);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const { data: order, isPending, error } = useQuery({
    queryKey: ['production', id],
    queryFn: () => fetchProductionById(id),
    staleTime: 1,
  });

  const { data: logs, isPending: logsPending } = useQuery({
    queryKey: ['productionLogs', id],
    queryFn: () => fetchProductionLogs(id),
    enabled: activeTab === 'history' || activeTab === 'materials',
  });

  // ─── Material summary derived from logs ──────────────────────────────────
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

  if (isPending) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center gap-y-4 p-6" edges={['top']}>
        <Icon as={AlertTriangle} className="text-destructive size-12" />
        <Text className="text-foreground text-xl font-bold">Order Not Found</Text>
        <Text className="text-muted-foreground text-center">
          {error?.message ?? 'This production order could not be loaded.'}
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const progress = order.quantityToProduce > 0
    ? (order.quantityProduced / order.quantityToProduce) * 100
    : 0;

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const isClosed = ['completed', 'cancelled'].includes(order.status?.toLowerCase());

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      {/* ── Dense Header ──────────────────────────────────────────────── */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
        <View className="mx-3 flex-1">
          <Text className="text-foreground text-base font-bold uppercase" numberOfLines={1}>
            {order.product?.name ?? 'Unknown Product'}
          </Text>
          <Text className="text-muted-foreground text-xs">{order.product?.code}</Text>
        </View>
        {!isClosed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings size={20} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {order.status?.toLowerCase() === 'pending' ? (
                <DropdownMenuItem>
                  <TouchableOpacity className="flex-1" onPress={() => mutation.mutate('in_progress')}>
                    <Text>Start Order</Text>
                  </TouchableOpacity>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem>
                <TouchableOpacity className="flex-1" onPress={() => handleCloseOrder('completed')}>
                  <Text>Mark Completed</Text>
                </TouchableOpacity>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TouchableOpacity className="flex-1" onPress={() => handleCloseOrder('cancelled')}>
                  <Text className="text-destructive">Cancel Order</Text>
                </TouchableOpacity>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Badge variant={getStatusVariant(order.status)} className="self-center ml-1">
          <Text className="text-xs">{order.status?.toUpperCase() ?? 'UNKNOWN'}</Text>
        </Badge>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="py-5"
        showsVerticalScrollIndicator={false}>

        {/* ── Progress Card ─────────────────────────────────────────────── */}
        <View className="mb-4 px-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Production Progress</CardTitle>
              <Text className="text-muted-foreground text-sm">Target: {order.quantityToProduce} units</Text>
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
                <Button variant="outline" className="flex-1" onPress={() => setMaterialModalVisible(true)}>
                  <Icon as={FlaskConicalIcon} className="text-foreground mr-2 size-4" />
                  <Text>Log Material</Text>
                </Button>
              </CardFooter>
            )}
          </Card>
        </View>

        {/* ── Tab Pills ─────────────────────────────────────────────────── */}
        <View className="mb-4 px-6">
          <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
            {['overview', 'materials', 'history'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-lg py-2 ${activeTab === tab ? 'bg-card shadow-sm' : ''}`}>
                <Text className={`text-xs font-semibold capitalize ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <View className="px-6">
          {activeTab === 'overview' && <ProductionOverviewTab order={order} />}
          {activeTab === 'materials' && (
            <ProductionMaterialsTab
              materialSummary={materialSummary}
              logsPending={logsPending}
              isClosed={isClosed}
              onLogMaterial={() => setMaterialModalVisible(true)}
            />
          )}
          {activeTab === 'history' && (
            <ProductionHistoryTab order={order} logs={logs} logsPending={logsPending} />
          )}
        </View>
      </ScrollView>

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
        onConfirm={() => { confirmConfig?.resolve(true); setConfirmConfig(null); }}
        onCancel={() => { confirmConfig?.resolve(false); setConfirmConfig(null); }}
      />
    </SafeAreaView>
  );
};

export default ProductionManagePage;
