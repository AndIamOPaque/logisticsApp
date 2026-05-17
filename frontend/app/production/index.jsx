import React, { useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { PlusIcon, FactoryIcon, SearchIcon, XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Sidebar } from '@/components/dashboard/sidebar';
import ProductionCard from '@/components/production/productionCard';
import AddProductionModal from '@/components/production/addProductionModal';
import { fetchProductions } from '@/api/production';
import DateTimePicker from '@react-native-community/datetimepicker';

const STATUS_PILLS = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'in_progress' },
  { label: 'Done', value: 'completed' },
];

// Groups an array of production orders by their creation date (YYYY-MM-DD)
function groupByDate(items) {
  const groups = [];
  const map = {};
  items.forEach((item) => {
    const key = new Date(item.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!map[key]) {
      map[key] = [];
      groups.push({ date: key, items: map[key] });
    }
    map[key].push(item);
  });
  return groups;
}

const ProductionPage = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  // Filters — status and date range hit backend, name search is client-side
  const [statusFilter, setStatusFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Build query params for backend
  const queryParams = useMemo(() => {
    const params = { limit: 50 };
    if (statusFilter) params.status = statusFilter;
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];
    return params;
  }, [statusFilter, startDate, endDate]);

  const {
    data: result,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryFn: () => fetchProductions(queryParams),
    queryKey: ['production', queryParams],
  });

  const productions = result?.data ?? [];

  // Client-side name search — does NOT hit backend
  const filteredProductions = useMemo(() => {
    if (!searchText.trim()) return productions;
    const q = searchText.toLowerCase();
    return productions.filter(p =>
      p.product?.name?.toLowerCase().includes(q) ||
      p.product?.code?.toLowerCase().includes(q)
    );
  }, [productions, searchText]);

  // Group filtered results by date for display
  const groupedProductions = useMemo(() => groupByDate(filteredProductions), [filteredProductions]);

  const hasDateFilter = startDate || endDate;

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
            <Icon as={FactoryIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Production</Text>
          </View>
        </View>
        <Button
          size="sm"
          onPress={() => setShowModal(true)}
          className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">New Order</Text>
        </Button>
      </View>

      {/* Search Bar */}
      <View className="bg-card border-b border-border px-4 py-1.5">
        <View className="border-border bg-background flex-row items-center gap-x-2 rounded-xl border px-3 py-2">
          <Icon as={SearchIcon} className="text-muted-foreground size-4" />
          <TextInput
            className="text-foreground flex-1 text-sm"
            placeholder="Search by product name…"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon as={XIcon} className="text-muted-foreground size-4" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status + Date Filters — these hit backend */}
      <View className="bg-card border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center', height: 46 }}>
          {STATUS_PILLS.map(pill => (
            <TouchableOpacity
              key={pill.label}
              onPress={() => setStatusFilter(pill.value)}
              className={`rounded-full border px-3 py-1.5 ${statusFilter === pill.value ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
              <Text className={`text-xs font-semibold ${statusFilter === pill.value ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View className="w-[1px] h-4 bg-border mx-1" />

          {/* Date range */}
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            className={`rounded-full border px-3 py-1.5 ${startDate ? 'border-primary bg-primary' : 'border-border'}`}>
            <Text className={`text-xs font-semibold ${startDate ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {startDate ? startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'From'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            className={`rounded-full border px-3 py-1.5 ${endDate ? 'border-primary bg-primary' : 'border-border'}`}>
            <Text className={`text-xs font-semibold ${endDate ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {endDate ? endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'To'}
            </Text>
          </TouchableOpacity>

          {hasDateFilter && (
            <TouchableOpacity
              onPress={() => { setStartDate(null); setEndDate(null); }}
              className="bg-destructive/10 rounded-full px-2.5 py-1.5">
              <Text className="text-destructive text-xs font-semibold">Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(e, date) => { setShowStartPicker(false); if (date) setStartDate(date); }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(e, date) => { setShowEndPicker(false); if (date) setEndDate(date); }}
        />
      )}

      {/* Content */}
      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-y-3 px-8">
          <Text className="text-center text-red-500">{error.message}</Text>
          <Button variant="outline" size="sm" onPress={refetch}>
            <Text>Retry</Text>
          </Button>
        </View>
      ) : filteredProductions.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-y-3">
          <View className="bg-muted rounded-full p-5">
            <Icon as={FactoryIcon} className="text-muted-foreground size-10" />
          </View>
          <Text className="text-muted-foreground">
            {searchText ? 'No matching orders.' : 'No production orders yet.'}
          </Text>
          {!searchText && (
            <Button size="sm" onPress={() => setShowModal(true)}>
              <Text>Create First Order</Text>
            </Button>
          )}
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
          {groupedProductions.map(({ date, items: dayItems }) => (
            <View key={date}>
              {/* Date separator */}
              <View className="bg-background px-4 py-2 border-b border-border">
                <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  {date}
                </Text>
              </View>
              {dayItems.map((production) => (
                <ProductionCard
                  key={production._id}
                  production={production}
                  onPress={() => router.push(`/production/${production._id}`)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <AddProductionModal visible={showModal} onClose={() => setShowModal(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
};

export default ProductionPage;
