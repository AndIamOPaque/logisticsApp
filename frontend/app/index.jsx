import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LayoutDashboardIcon, PlusIcon, SlidersHorizontalIcon, TruckIcon } from 'lucide-react-native';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProductionWidget } from '@/components/dashboard/productionWidget';
import { DeliveriesWidget } from '@/components/dashboard/deliveriesWidget';
import { LowStockWidget } from '@/components/dashboard/lowStockWidget';
import { StockAdjustmentModal } from '@/components/dashboard/stockAdjustmentModal';
import AddProductionModal from '@/components/production/addProductionModal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const SAMPLE_PRODUCT = {
  _id: '6641a2b3c4d5e6f700000001',
  name: 'Yellow Duck Toy',
  code: 'PROD-001',
};

export default function DashboardScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [productionModalVisible, setProductionModalVisible] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }} edges={['top']}>
      {/* Header — consistent with production page */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-3">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setSidebarOpen(true)}
            className="rounded-lg h-8 w-8">
            <View className="gap-y-1">
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
              <View className="bg-foreground h-0.5 w-4 rounded-full" />
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
            </View>
          </Button>
          <View className="flex-row items-center gap-x-2">
            <Icon as={LayoutDashboardIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Dashboard</Text>
          </View>
        </View>
      </View>

      {/* Content — full width, no px on ScrollView */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>

        {/* Section label */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Live Overview
          </Text>
        </View>

        <ProductionWidget />
        <DeliveriesWidget />
        <LowStockWidget />

        {/* Quick Actions */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Quick Actions
          </Text>
        </View>

        <View className="flex-row gap-x-3 px-4 pb-4">
          <Button
            variant="outline"
            className="border-border flex-1 rounded-xl py-5"
            onPress={() => setStockModalVisible(true)}>
            <View className="items-center gap-y-1">
              <Icon as={SlidersHorizontalIcon} className="text-muted-foreground size-4" />
              <Text className="text-foreground text-xs font-semibold">Adjust Stock</Text>
            </View>
          </Button>
          <Button
            variant="outline"
            className="border-border flex-1 rounded-xl py-5">
            <View className="items-center gap-y-1">
              <Icon as={TruckIcon} className="text-muted-foreground size-4" />
              <Text className="text-foreground text-xs font-semibold">New Delivery</Text>
            </View>
          </Button>
          <Button
            variant="outline"
            className="border-border flex-1 rounded-xl py-5"
            onPress={() => setProductionModalVisible(true)}>
            <View className="items-center gap-y-1">
              <Icon as={PlusIcon} className="text-muted-foreground size-4" />
              <Text className="text-foreground text-xs font-semibold">New Order</Text>
            </View>
          </Button>
        </View>
      </ScrollView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <StockAdjustmentModal
        product={SAMPLE_PRODUCT}
        visible={stockModalVisible}
        onClose={() => setStockModalVisible(false)}
      />
      <AddProductionModal
        visible={productionModalVisible}
        onClose={() => setProductionModalVisible(false)}
      />
    </SafeAreaView>
  );
}
