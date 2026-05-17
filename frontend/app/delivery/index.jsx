import React, { useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { PlusIcon, Truck, Filter } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/dashboard/sidebar';
import DeliveryCard from '@/components/delivery/deliveryCard';
import AddDeliveryModal from '@/components/delivery/addDeliveryModal';
import { fetchDeliveries } from '@/api/delivery';
import { fetchLocations } from '@/api/location';
import { fetchParties } from '@/api/party';
import { ThemedSelect } from '@/components/ui/themed-select';
import DateTimePicker from '@react-native-community/datetimepicker';

const STATUSES = ['pending', 'in-transit', 'delivered', 'cancelled'];
const DIRECTIONS = ['in', 'out', 'transfer'];
const DIR_LABELS = { in: 'Inbound', out: 'Outbound', transfer: 'Transfer' };

export default function DeliveryPage() {
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [directionFilter, setDirectionFilter] = useState(null);
  const [partyFilter, setPartyFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const tabBarHeight = useBottomTabBarHeight();

  const queryParams = useMemo(() => ({
    status: statusFilter || undefined,
    direction: directionFilter || undefined,
    partyId: partyFilter || undefined,
    locationId: locationFilter || undefined,
    startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
    endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
  }), [statusFilter, directionFilter, partyFilter, locationFilter, startDate, endDate]);

  // Fetch parties & locations for filter dropdowns
  const { data: locationsData } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const { data: partiesData } = useQuery({ queryKey: ['parties'], queryFn: fetchParties });

  const locationOptions = (Array.isArray(locationsData?.data) ? locationsData.data : (Array.isArray(locationsData) ? locationsData : []))
    .map(l => ({ label: l.name, value: l._id }));
  const partyOptions = (Array.isArray(partiesData?.data) ? partiesData.data : (Array.isArray(partiesData) ? partiesData : []))
    .map(p => ({ label: p.name, value: p._id }));

  const {
    data: deliveries,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryFn: () => fetchDeliveries(queryParams),
    queryKey: ['deliveries', statusFilter, directionFilter, partyFilter, locationFilter, queryParams.startDate, queryParams.endDate],
  });

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
            <Icon as={Truck} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Deliveries</Text>
          </View>
        </View>
        <Button
          size="sm"
          onPress={() => setShowModal(true)}
          className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">New</Text>
        </Button>
      </View>

      {/* Filters */}
      <View style={{ height: 46 }} className="border-border bg-card border-b">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center', height: 46 }}>

          <View className="flex-row items-center mr-2">
            <Icon as={Filter} className="size-3 text-muted-foreground mr-1" />
            <Text className="text-xs font-semibold text-muted-foreground uppercase">Dir</Text>
          </View>

          <TouchableOpacity
            onPress={() => setDirectionFilter(null)}
            className={`rounded-full border px-3 py-1.5 ${!directionFilter ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
            <Text className={`text-xs font-semibold ${!directionFilter ? 'text-primary-foreground' : 'text-muted-foreground'}`}>All</Text>
          </TouchableOpacity>
          {DIRECTIONS.map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setDirectionFilter(directionFilter === d ? null : d)}
              className={`rounded-full border px-3 py-1.5 ${directionFilter === d ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
              <Text className={`text-xs font-semibold capitalize ${directionFilter === d ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{DIR_LABELS[d]}</Text>
            </TouchableOpacity>
          ))}

          <View className="w-[1px] h-4 bg-border mx-2" />

          {STATUSES.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatusFilter(statusFilter === s ? null : s)}
              className={`rounded-full border px-3 py-1.5 ${statusFilter === s ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
              <Text className={`text-xs font-semibold capitalize ${statusFilter === s ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date Range Filter */}
      <View className="bg-card border-b border-border flex-row items-center gap-x-2 px-4 py-2">
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          className={`rounded-full border px-3 py-1.5 ${startDate ? 'border-primary bg-primary' : 'border-border'}`}>
          <Text className={`text-xs font-semibold ${startDate ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
            {startDate ? startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'From Date'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          className={`rounded-full border px-3 py-1.5 ${endDate ? 'border-primary bg-primary' : 'border-border'}`}>
          <Text className={`text-xs font-semibold ${endDate ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
            {endDate ? endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'To Date'}
          </Text>
        </TouchableOpacity>
        {hasDateFilter && (
          <TouchableOpacity
            onPress={() => { setStartDate(null); setEndDate(null); }}
            className="bg-destructive/10 rounded-full px-2.5 py-1.5">
            <Text className="text-destructive text-xs font-semibold">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Party & Location Filters */}
      <View className="bg-card border-b border-border flex-row items-center gap-x-3 px-4 py-2">
        <View className="flex-1">
          <ThemedSelect
            items={[{ label: 'All Parties', value: '' }, ...partyOptions]}
            value={partyFilter || ''}
            onValueChange={(v) => setPartyFilter(v || null)}
            placeholder="Party"
          />
        </View>
        <View className="flex-1">
          <ThemedSelect
            items={[{ label: 'All Locations', value: '' }, ...locationOptions]}
            value={locationFilter || ''}
            onValueChange={(v) => setLocationFilter(v || null)}
            placeholder="Location"
          />
        </View>
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
      ) : deliveries?.deliveries?.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-y-3">
          <View className="bg-muted rounded-full p-5">
            <Icon as={Truck} className="text-muted-foreground size-10" />
          </View>
          <Text className="text-muted-foreground">No deliveries found.</Text>
          <Button size="sm" onPress={() => setShowModal(true)}>
            <Text>Create Delivery</Text>
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
          {deliveries?.deliveries?.map((delivery) => (
            <DeliveryCard
              key={delivery._id}
              delivery={delivery}
              onPress={() => router.push(`/delivery/${delivery._id}`)}
            />
          ))}
        </ScrollView>
      )}

      <AddDeliveryModal visible={showModal} onClose={() => setShowModal(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
