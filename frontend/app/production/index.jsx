import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { PlusIcon, FactoryIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import ProductionCard from '@/components/production/productionCard';
import AddProductionModal from '@/components/production/addProductionModal';
import { fetchProductions } from '@/api/production';

const ProductionPage = () => {
  const [showModal, setShowModal] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const {
    data: productions,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryFn: fetchProductions,
    queryKey: ['production'],
  });

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-2">
          <Icon as={FactoryIcon} className="text-foreground size-5" />
          <Text className="text-foreground text-lg font-bold">Production</Text>
        </View>
        <Button
          size="sm"
          onPress={() => setShowModal(true)}
          className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">New Order</Text>
        </Button>
      </View>

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
      ) : productions?.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-y-3">
          <View className="bg-muted rounded-full p-5">
            <Icon as={FactoryIcon} className="text-muted-foreground size-10" />
          </View>
          <Text className="text-muted-foreground">No production orders yet.</Text>
          <Button size="sm" onPress={() => setShowModal(true)}>
            <Text>Create First Order</Text>
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 58 }}>
          {productions?.map((production) => (
            <ProductionCard
              key={production._id}
              production={production}
              onPress={() => router.push(`/production/${production._id}`)}
            />
          ))}
        </ScrollView>
      )}

      <AddProductionModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
};

export default ProductionPage;
