import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ChevronLeftIcon, AlertTriangle, PencilIcon, TrashIcon, RotateCcwIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  fetchRawMaterialById, 
  fetchRawMaterialLogs, 
  fetchRawMaterialStockLevels, 
  fetchProductsUsingMaterial,
  updateRawMaterial 
} from '@/api/raw-material';
import ConfirmDialog from '@/components/ui/confirmDialog';

import { RawMaterialOverviewTab, RawMaterialLogsTab, RawMaterialUsedInTab } from '@/components/raw-material/rawMaterialTabs';
import { EditModal } from '@/components/raw-material/rawMaterialModals';
import { StockAdjustmentModal } from '@/components/dashboard/stockAdjustmentModal';

export default function RawMaterialManagePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState('overview');
  const [editVisible, setEditVisible] = useState(false);
  const [adjustVisible, setAdjustVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: material, isPending, error } = useQuery({
    queryKey: ['rawMaterial', id],
    queryFn: () => fetchRawMaterialById(id),
  });

  const { data: logs, isPending: logsPending } = useQuery({
    queryKey: ['rawMaterialLogs', id],
    queryFn: () => fetchRawMaterialLogs(id),
    enabled: activeTab === 'logs',
  });

  const { data: stockLevels, isPending: stockPending } = useQuery({
    queryKey: ['rawMaterialStock', id],
    queryFn: () => fetchRawMaterialStockLevels(id),
    enabled: activeTab === 'overview',
  });

  const { data: productsUsing, isPending: productsPending } = useQuery({
    queryKey: ['productsUsingMaterial', id],
    queryFn: () => fetchProductsUsingMaterial(id),
    enabled: activeTab === 'used-in',
  });

  const deleteMutation = useMutation({
    mutationFn: () => updateRawMaterial(id, { isActive: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rawMaterials'] });
      router.back();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => updateRawMaterial(id, { isActive: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rawMaterial', id] });
      qc.invalidateQueries({ queryKey: ['rawMaterials'] });
    },
  });

  if (isPending) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !material) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center gap-y-4 p-6" edges={['top']}>
        <Icon as={AlertTriangle} className="text-destructive size-12" />
        <Text className="text-foreground text-xl font-bold">Material Not Found</Text>
        <Text className="text-muted-foreground text-center">
          {error?.message ?? 'This raw material could not be loaded.'}
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const totalStock = stockLevels?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
        <Text className="text-foreground mx-3 flex-1 text-base font-bold uppercase" numberOfLines={1}>
          {material.name}
        </Text>
        <View className="flex-row gap-x-2">
          <Button variant="outline" size="icon" onPress={() => setEditVisible(true)} className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
          {material.isActive === false ? (
            <Button variant="outline" size="icon" onPress={() => reactivateMutation.mutate()} className="rounded-xl border-green-500">
              <Icon as={RotateCcwIcon} className="text-green-500 size-4" />
            </Button>
          ) : (
            <Button variant="destructive" size="icon" onPress={() => setDeleteConfirm(true)} className="rounded-xl">
              <Icon as={TrashIcon} className="text-white size-4" />
            </Button>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}
        showsVerticalScrollIndicator={false}>
        
        <View className="px-6 pb-4">
          <Badge variant={material.isActive === false ? 'destructive' : 'default'} className="mb-2 self-start">
            <Text>{material.isActive === false ? 'INACTIVE' : 'ACTIVE'}</Text>
          </Badge>
          <Text className="text-foreground text-3xl font-black tracking-tight uppercase">
            {material.name}
          </Text>
          <Text className="text-muted-foreground text-lg font-medium">
            {material.code || 'NO CODE'}
          </Text>
        </View>

        {/* Tab Pills */}
        <View className="mb-4 px-6">
          <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
            {['overview', 'logs', 'used-in'].map((tab) => (
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

        {/* Tab Content */}
        <View className="px-6">
          {activeTab === 'overview' && (
            <RawMaterialOverviewTab 
              material={material} 
              stockLevels={stockLevels} 
              stockPending={stockPending} 
              totalStock={totalStock} 
              onAdjustStock={() => setAdjustVisible(true)} 
            />
          )}
          {activeTab === 'logs' && <RawMaterialLogsTab logs={logs} logsPending={logsPending} />}
          {activeTab === 'used-in' && <RawMaterialUsedInTab productsUsing={productsUsing} productsPending={productsPending} />}
        </View>
      </ScrollView>

      <EditModal material={material} visible={editVisible} onClose={() => setEditVisible(false)} />
      {adjustVisible && (
        <StockAdjustmentModal 
          item={material} 
          itemModel="RawMaterial"
          visible={adjustVisible} 
          onClose={() => setAdjustVisible(false)} 
        />
      )}
      <ConfirmDialog
        visible={deleteConfirm}
        title="Deactivate Raw Material"
        message="Are you sure you want to deactivate this raw material?"
        confirmText="Deactivate"
        variant="destructive"
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteConfirm(false);
        }}
        onCancel={() => setDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}
