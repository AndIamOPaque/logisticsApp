import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FileText, FilterIcon, PlusIcon } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ThemedSelect } from '@/components/ui/themed-select';
import BillCard from '@/components/bill/BillCard';
import { fetchBills } from '@/api/bill';
import { fetchEmployees } from '@/api/employee';

export default function BillsPage() {
  const tabBarHeight = useBottomTabBarHeight();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, PAID
  const [employeeFilter, setEmployeeFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  // Fetch employees for filter
  const { data: employeesData } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
  const employeeOptions = (Array.isArray(employeesData?.data) ? employeesData.data : [])
    .map(e => ({ label: e.name, value: e._id }));

  // We memoize the query params to prevent unnecessary refetches
  const queryParams = React.useMemo(() => {
    const params = { limit: 50 };
    if (activeTab !== 'ALL') {
      params.status = activeTab;
    }
    if (employeeFilter) {
      params.partyId = employeeFilter;
    }
    if (typeFilter) {
      params.type = typeFilter;
    }
    return params;
  }, [activeTab, employeeFilter, typeFilter]);

  const { data, isPending, error } = useQuery({
    queryKey: ['bills', queryParams],
    queryFn: () => fetchBills(queryParams),
  });

  const bills = data?.data?.data || [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
      {/* HEADER */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-3">
          <Button variant="ghost" size="icon" onPress={() => setSidebarOpen(true)} className="rounded-lg h-8 w-8">
            <View className="gap-y-1">
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
              <View className="bg-foreground h-0.5 w-4 rounded-full" />
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
            </View>
          </Button>
          <View className="flex-row items-center gap-x-2">
            <Icon as={FileText} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Finance</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-x-2">
          {/* <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
            <Icon as={FilterIcon} className="text-foreground size-4" />
          </Button> */}
          <Button
            size="sm"
            className="flex-row items-center gap-x-1.5 rounded-xl px-3"
            onPress={() => router.push('/bill/create')} // Optional Create screen
          >
            <Icon as={PlusIcon} className="text-primary-foreground size-4" />
            <Text className="text-primary-foreground text-sm font-semibold">New Bill</Text>
          </Button>
        </View>
      </View>

      {/* FILTER PILLS */}
      <View style={{ height: 46 }} className="bg-card border-border border-b">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center', height: 46 }}>
          {['ALL', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full px-4 h-8 ${isActive ? '' : 'bg-transparent'}`}
                onPress={() => setActiveTab(tab)}>
                <Text className={isActive ? 'text-primary-foreground font-bold text-xs' : 'text-foreground font-semibold text-xs'}>
                  {tab}
                </Text>
              </Button>
            );
          })}
        </ScrollView>
      </View>

      {/* Filters Row */}
      <View className="bg-card border-border border-b px-4 py-1.5 flex-row gap-x-2">
        <View className="flex-1">
          <ThemedSelect
            items={[{ label: 'All Parties', value: '' }, ...employeeOptions]}
            value={employeeFilter || ''}
            onValueChange={(v) => setEmployeeFilter(v || null)}
            placeholder="Filter by party…"
          />
        </View>
        <View className="flex-1">
          <ThemedSelect
            items={[
              { label: 'All Types', value: '' },
              { label: 'Income', value: 'INCOME' },
              { label: 'Expense', value: 'EXPENSE' },
            ]}
            value={typeFilter || ''}
            onValueChange={(v) => setTypeFilter(v || null)}
            placeholder="Bill type…"
          />
        </View>
      </View>

      {/* LIST */}
      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-destructive font-bold">Error loading bills</Text>
        </View>
      ) : bills.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6 gap-y-2">
          <Icon as={FileText} className="text-muted-foreground size-12" />
          <Text className="text-muted-foreground font-medium">No bills found.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 55 }}>
          {bills.map((bill) => (
            <BillCard
              key={bill._id}
              bill={bill}
              onPress={() => router.push(`/bill/${bill._id}`)}
            />
          ))}
        </ScrollView>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
