import { View, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { fetchProducts } from '@/api/product';
import { useQuery } from '@tanstack/react-query';
import { fetchLocations } from '@/api/location';
import ProductCard from '@/components/productCard';
import { StockAdjustmentModal } from '@/components/dashboard/stockAdjustmentModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { PackageIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react-native';

export default function ProductPage() {
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const {data: products, isPending: isProductPending, error: productError, refetch} = useQuery({
    queryFn: () => fetchProducts({search: debouncedSearch}),
    queryKey:['products', debouncedSearch],
    staleTime: 100*60*60,
  });
  
  const {data: locations, isPending: isLocationPending} = useQuery({
    queryKey:['locations'],
    queryFn: () => fetchLocations(),
    staleTime: 10*60*60,
  });
  
  const tabBarHeight = useBottomTabBarHeight();

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
            <Icon as={PackageIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Products</Text>
          </View>
        </View>
        <Button size="sm" className="flex-row items-center gap-x-1.5">
          <Icon as={PlusIcon} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-xs font-semibold">Add</Text>
        </Button>
      </View>

      {/* Search bar */}
      <View className="border-border bg-card border-b px-4 pt-2 pb-3">
        <View className="border-border bg-background flex-row items-center gap-x-2 rounded-xl border px-3 py-2.5">
          <Icon as={SearchIcon} className="text-muted-foreground size-4" />
          <TextInput
            className="text-foreground flex-1 text-sm"
            placeholder="Search products…"
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

      {/* Content */}
      {isProductPending ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      ) : productError ? (
        <ErrorMessage error={productError} onRetry={refetch} />
      ) : products?.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-y-3">
          <View className="bg-muted rounded-full p-5">
            <Icon as={PackageIcon} className="text-muted-foreground size-10" />
          </View>
          <Text className="text-muted-foreground">
            {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No products found.'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        >
          {products?.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onAdjustStock={() => setSelectedProduct(product)} 
            />
          ))}
        </ScrollView>
      )}

      {!isLocationPending && selectedProduct && (
        <StockAdjustmentModal 
          product={selectedProduct} 
          visible={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}

