import * as React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  FactoryIcon,
  WarehouseIcon,
  BuildingIcon,
  RotateCcwIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fetchLocationById, deactivateLocation, updateLocation } from '@/api/location';

import { EditModal } from '@/components/location/locationModals';
import {
  LocationHero,
  LocationDetailsCard,
  LocationContactCard,
  LocationCapacityCard,
} from '@/components/location/LocationOverviewTab';

const TYPE_CONFIG = {
  factory: { label: 'Factory', icon: FactoryIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  warehouse: {
    label: 'Warehouse',
    icon: WarehouseIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  office: { label: 'Office', icon: BuildingIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [editVisible, setEditVisible] = React.useState(false);

  const reactivateMutation = useMutation({
    mutationFn: () => updateLocation(id, { isActive: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['location', id] });
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const { data, isPending, isError } = useQuery({
    queryKey: ['location', id],
    queryFn: () => fetchLocationById(id),
  });

  const location = data?.data;
  const cfg = location ? (TYPE_CONFIG[location.type] ?? TYPE_CONFIG.factory) : null;

  const { mutate: deactivate, isPending: deactivating } = useMutation({
    mutationFn: (force) => deactivateLocation(id, force),
    meta: { successMessage: 'Location deactivated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      router.back();
    },
    onError: (err) => {
      Alert.alert(
        'Cannot Deactivate',
        err.message + '\n\nForce deactivate and zero out all stock?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Force Deactivate', style: 'destructive', onPress: () => deactivate(true) },
        ]
      );
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Deactivate Location',
      'This will deactivate the location. If it has stock, you will be warned.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => deactivate(false) },
      ]
    );
  };

  if (isPending) {
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background items-center justify-center"
        edges={['top']}>
        <Text className="text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  }

  if (isError || !location) {
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background items-center justify-center gap-y-3"
        edges={['top']}>
        <Text className="text-red-500">Could not load location.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
        <Text className="text-foreground mx-3 flex-1 text-base font-bold" numberOfLines={1}>
          {location.name}
        </Text>
        <View className="flex-row gap-x-2">
          <Button
            variant="outline"
            size="icon"
            onPress={() => setEditVisible(true)}
            className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
          {location.isActive === false ? (
            <Button
              variant="outline"
              size="icon"
              onPress={() => reactivateMutation.mutate()}
              className="rounded-xl border-green-500">
              <Icon as={RotateCcwIcon} className="size-4 text-green-500" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="icon"
              onPress={handleDelete}
              disabled={deactivating}
              className="rounded-xl">
              <Icon as={TrashIcon} className="size-4 text-white" />
            </Button>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="py-5 gap-y-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
        <LocationHero cfg={cfg} location={location} />
        <LocationDetailsCard location={location} />
        <LocationContactCard location={location} />
        <LocationCapacityCard location={location} />
      </ScrollView>

      <EditModal location={location} visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
}
