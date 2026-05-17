import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  LayoutDashboardIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TruckIcon,
  PackageIcon,
  UsersIcon,
  FileTextIcon,
  MapPinIcon,
} from 'lucide-react-native';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProductionWidget } from '@/components/dashboard/productionWidget';
import { DeliveriesWidget } from '@/components/dashboard/deliveriesWidget';
import { LowStockWidget } from '@/components/dashboard/lowStockWidget';
import { StockAdjustmentModal } from '@/components/dashboard/stockAdjustmentModal';
import AddProductionModal from '@/components/production/addProductionModal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { fetchProducts } from '@/api/product';
import { fetchEmployees } from '@/api/employee';
import { fetchBills } from '@/api/bill';
import { fetchLocations } from '@/api/location';

function StatCard({ icon, label, value, color, bg, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 bg-card border border-border rounded-2xl px-3.5 py-3">
      <View className={`self-start rounded-lg p-1.5 ${bg} mb-2`}>
        <Icon as={icon} className={`size-3.5 ${color}`} />
      </View>
      <Text className="text-foreground text-xl font-black">{value ?? '–'}</Text>
      <Text className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mt-0.5">{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [productionModalVisible, setProductionModalVisible] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  // Quick stats
  const { data: productsData } = useQuery({
    queryKey: ['products', 'dashboard-count'],
    queryFn: () => fetchProducts({ limit: 100 }),
    staleTime: 60000,
  });
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 60000,
  });
  const { data: billsData } = useQuery({
    queryKey: ['bills', 'pending-count'],
    queryFn: () => fetchBills({ status: 'PENDING', limit: 1 }),
    staleTime: 60000,
  });
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => fetchLocations(),
    staleTime: 60000,
  });

  const productCount = Array.isArray(productsData) ? productsData.length : 0;
  const employeeCount = (employeesData?.data || []).length;
  const pendingBills = billsData?.data?.meta?.total ?? (Array.isArray(billsData?.data?.data) ? billsData.data.data.length : 0);
  const locationCount = (locationsData?.data || []).length;

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
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

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>

        {/* Summary Stats */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            At a Glance
          </Text>
        </View>
        <View className="flex-row gap-x-2 px-4 pb-3">
          <StatCard
            icon={PackageIcon}
            label="Products"
            value={productCount}
            color="text-blue-500"
            bg="bg-blue-500/10"
            onPress={() => router.push('/product')}
          />
          <StatCard
            icon={UsersIcon}
            label="Employees"
            value={employeeCount}
            color="text-purple-500"
            bg="bg-purple-500/10"
            onPress={() => router.push('/employee')}
          />
          <StatCard
            icon={FileTextIcon}
            label="Pending"
            value={pendingBills}
            color="text-amber-500"
            bg="bg-amber-500/10"
            onPress={() => router.push('/bill')}
          />
          <StatCard
            icon={MapPinIcon}
            label="Locations"
            value={locationCount}
            color="text-green-500"
            bg="bg-green-500/10"
            onPress={() => router.push('/location')}
          />
        </View>

        {/* Section label */}
        <View className="px-4 pt-2 pb-2">
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
            className="border-border flex-1 rounded-xl py-5"
            onPress={() => router.push('/delivery')}>
            <View className="items-center gap-y-1">
              <Icon as={TruckIcon} className="text-muted-foreground size-4" />
              <Text className="text-foreground text-xs font-semibold">Deliveries</Text>
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
        product={null}
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
