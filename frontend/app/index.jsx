// app/index.jsx  (or your main screen file)
import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProductionWidget } from '@/components/dashboard/productionWidget';
import { DeliveriesWidget } from '@/components/dashboard/deliveriesWidget';
import { StockAdjustmentModal } from '@/components/dashboard/stockAdjustmentModal';
import AddProductionModal from '@/components/production/addProductionModal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { SlidersHorizontalIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// ─── Sample Data ────────────────────────────────────────────────────────────

const SAMPLE_PRODUCT = {
  _id: '6641a2b3c4d5e6f700000001',
  name: 'Yellow Duck Toy',
  code: 'PROD-001',
};

const SCREEN_OPTIONS = {
  headerShown: false,
};

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function Screen() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [stockModalVisible, setStockModalVisible] = React.useState(false);
  const [productionModalVisible, setProductionModalVisible] = React.useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <SafeAreaView className="bg-background" style={{ flex: 1 }} edges={['top']}>
        {/* ── Top Bar ── */}
        <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setSidebarOpen(true)}
            className="rounded-lg">
            {/* Hamburger icon — three lines */}
            <View className="gap-y-1">
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
              <View className="bg-foreground h-0.5 w-4 rounded-full" />
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
            </View>
          </Button>

          <Text className="text-foreground text-lg font-bold tracking-tight">Operations</Text>

          <Button
            variant="outline"
            size="sm"
            onPress={() => setStockModalVisible(true)}
            className="border-border flex-row items-center gap-x-1.5 rounded-lg">
            <Icon as={SlidersHorizontalIcon} className="text-muted-foreground size-3.5" />
            <Text className="text-muted-foreground text-xs font-medium">Adjust Stock</Text>
          </Button>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-4 gap-y-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Live Overview
          </Text>

          <ProductionWidget />
          <DeliveriesWidget />

          <Text className="text-muted-foreground mt-2 text-xs font-bold tracking-widest uppercase">
            Quick Actions
          </Text>

          <View className="flex-row gap-x-3">
            <Button
              variant="outline"
              className="border-border flex-1 rounded-xl py-5"
              onPress={() => setStockModalVisible(true)}>
              <Text className="text-foreground text-xs font-semibold">+ Adjust Stock</Text>
            </Button>
            <Button variant="outline" className="border-border flex-1 rounded-xl py-5">
              <Text className="text-foreground text-xs font-semibold">New Delivery</Text>
            </Button>
            <Button
              variant="outline"
              className="border-border flex-1 rounded-xl py-5"
              onPress={() => setProductionModalVisible(true)}>
              <Text className="text-foreground text-xs font-semibold">New Order</Text>
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
    </>
  );
}
