import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { UsersIcon, SearchIcon, PlusIcon, ChevronRightIcon, XIcon, UserIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/dashboard/sidebar';
import { fetchEmployees } from '@/api/employee';
import CreateEmployeeModal from '@/components/employee/CreateEmployeeModal';
import { ErrorMessage } from '@/components/ui/errorMessage';

// Role config
const ROLE_CONFIG = {
  worker: { label: 'Worker', bg: 'bg-blue-500/10', color: 'text-blue-500' },
  manager: { label: 'Manager', bg: 'bg-purple-500/10', color: 'text-purple-500' },
  driver: { label: 'Driver', bg: 'bg-amber-500/10', color: 'text-amber-500' },
  admin: { label: 'Admin', bg: 'bg-red-500/10', color: 'text-red-500' },
};

function EmployeeCard({ employee, onPress }) {
  const roleCfg = ROLE_CONFIG[employee.role] || ROLE_CONFIG.worker;
  return (
    <View className="bg-card border-b border-border">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center gap-x-3 px-4 py-4">
        <View className={`rounded-xl p-2.5 ${roleCfg.bg}`}>
          <Icon as={UserIcon} className={`size-5 ${roleCfg.color}`} />
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-sm font-semibold">{employee.name}</Text>
          <Text className="text-muted-foreground mt-0.5 text-xs">{employee.contact?.phone}</Text>
          <View className="mt-1.5 flex-row items-center gap-x-2">
            <View className={`rounded-full px-2 py-0.5 ${roleCfg.bg}`}>
              <Text className={`text-[10px] font-medium uppercase tracking-wider ${roleCfg.color}`}>{roleCfg.label}</Text>
            </View>
            {!employee.isActive && (
              <View className="bg-destructive/10 rounded-full px-2 py-0.5">
                <Text className="text-destructive text-[10px] font-medium uppercase tracking-wider">Inactive</Text>
              </View>
            )}
          </View>
        </View>
        <View className="items-end mr-2">
          <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Balance</Text>
          <Text className={`text-sm font-bold ${employee.balance < 0 ? 'text-destructive' : employee.balance > 0 ? 'text-green-500' : 'text-foreground'}`}>
            ₹{employee.balance}
          </Text>
        </View>
        <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
      </TouchableOpacity>
    </View>
  );
}

export default function EmployeeListScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['employees', debouncedSearch],
    queryFn: () => fetchEmployees(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const employees = data?.data || [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
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
            <Icon as={UsersIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Employees</Text>
          </View>
        </View>
        <Button size="sm" onPress={() => setCreateVisible(true)} className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">Add</Text>
        </Button>
      </View>

      <View className="border-border bg-card border-b px-4 py-1.5">
        <View className="border-border bg-background flex-row items-center gap-x-2 rounded-xl border px-3 py-2">
          <Icon as={SearchIcon} className="text-muted-foreground size-4" />
          <TextInput
            className="text-foreground flex-1 text-sm"
            placeholder="Search name or phone…"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon as={XIcon} className="text-muted-foreground size-4" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        className="flex-1"
      >
        {isPending && (
          <View className="items-center py-16">
            <Text className="text-muted-foreground text-sm">Loading employees…</Text>
          </View>
        )}
        {isError && <ErrorMessage error={{message: 'Failed to load employees'}} onRetry={refetch} />}
        {!isPending && !isError && employees.length === 0 && (
          <View className="items-center gap-y-3 py-16">
            <View className="bg-muted rounded-full p-4">
              <Icon as={UsersIcon} className="text-muted-foreground size-8" />
            </View>
            <Text className="text-muted-foreground text-sm">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No employees found.'}
            </Text>
          </View>
        )}
        {employees.map(emp => (
          <EmployeeCard key={emp._id} employee={emp} onPress={() => router.push(`/employee/${emp._id}`)} />
        ))}
      </ScrollView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CreateEmployeeModal visible={createVisible} onClose={() => setCreateVisible(false)} />
    </SafeAreaView>
  );
}
