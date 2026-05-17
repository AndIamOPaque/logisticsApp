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
import { fetchProductById, fetchProductLogs, getStockLevels, updateProduct } from '@/api/product';
import ConfirmDialog from '@/components/ui/confirmDialog';

import { ProductOverviewTab, ProductLogsTab, ProductRecipeTab } from '@/components/product/productTabs';
import { EditModal } from '@/components/product/productModals';
import { StockAdjustmentModal } from '@/components/dashboard/stockAdjustmentModal';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState('overview');
  const [editVisible, setEditVisible] = useState(false);
  const [adjustVisible, setAdjustVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: product, isPending, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });

  const { data: logs, isPending: logsPending } = useQuery({
    queryKey: ['productLogs', id],
    queryFn: () => fetchProductLogs(id),
    enabled: activeTab === 'logs',
  });

  const { data: stockLevels, isPending: stockPending } = useQuery({
    queryKey: ['stockLevels', id],
    queryFn: () => getStockLevels(id),
    enabled: activeTab === 'overview',
  });

  const deleteMutation = useMutation({
    mutationFn: () => updateProduct(id, { isActive: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      router.back();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => updateProduct(id, { isActive: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', id] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  if (isPending) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center gap-y-4 p-6" edges={['top']}>
        <Icon as={AlertTriangle} className="text-destructive size-12" />
        <Text className="text-foreground text-xl font-bold">Product Not Found</Text>
        <Text className="text-muted-foreground text-center">
          {error?.message ?? 'This product could not be loaded.'}
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
          {product.name}
        </Text>
        <View className="flex-row gap-x-2">
          <Button variant="outline" size="icon" onPress={() => setEditVisible(true)} className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
          {product.isActive === false ? (
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
          <Badge variant={product.isActive === false ? 'destructive' : 'default'} className="mb-2 self-start">
            <Text>{product.isActive === false ? 'INACTIVE' : 'ACTIVE'}</Text>
          </Badge>
          <Text className="text-foreground text-3xl font-black tracking-tight uppercase">
            {product.name}
          </Text>
          <Text className="text-muted-foreground text-lg font-medium">
            {product.code || 'NO CODE'}
          </Text>
        </View>

        {/* Tab Pills */}
        <View className="mb-4 px-6">
          <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
            {['overview', 'logs', 'recipe'].map((tab) => (
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
            <ProductOverviewTab 
              product={product} 
              stockLevels={stockLevels} 
              stockPending={stockPending} 
              totalStock={totalStock} 
              onAdjustStock={() => setAdjustVisible(true)} 
            />
          )}
          {activeTab === 'logs' && <ProductLogsTab logs={logs} logsPending={logsPending} />}
          {activeTab === 'recipe' && <ProductRecipeTab product={product} />}
        </View>
      </ScrollView>

      <EditModal product={product} visible={editVisible} onClose={() => setEditVisible(false)} />
      {adjustVisible && (
        <StockAdjustmentModal 
          item={product} 
          itemModel="Product"
          visible={adjustVisible} 
          onClose={() => setAdjustVisible(false)} 
        />
      )}
      <ConfirmDialog
        visible={deleteConfirm}
        title="Deactivate Product"
        message="Are you sure you want to deactivate this product?"
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
