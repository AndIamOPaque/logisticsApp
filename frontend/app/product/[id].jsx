import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  ChevronLeftIcon,
  PackageIcon,
  AlertTriangle,
  HistoryIcon,
  Settings2Icon,
  FileTextIcon
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProductById, fetchProductLogs, getStockLevels, correctStock } from '@/api/product';

const ProductManagePage = () => {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const tabBarHeight = 80;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: product, isPending, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });

  const { data: logs, isPending: logsPending } = useQuery({
    queryKey: ['productLogs', id],
    queryFn: () => fetchProductLogs(id),
    enabled: activeTab === 'logs',
  });

  const { data: stockLevels, isPending: stockPending } = useQuery({
    queryKey: ['stockLevels', id],
    queryFn: () => getStockLevels(id),
    enabled: activeTab === 'overview',
  });

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ quantity: '', reason: '', location: '' });

  const adjustMutation = useMutation({
    mutationFn: (data) => correctStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels', id] });
      queryClient.invalidateQueries({ queryKey: ['productLogs', id] });
      setAdjustModalVisible(false);
      setAdjustForm({ quantity: '', reason: '', location: '' });
    },
  });

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-y-4 p-6">
        <Icon as={AlertTriangle} className="text-destructive size-12" />
        <Text className="text-foreground text-xl font-bold">Product Not Found</Text>
        <Text className="text-muted-foreground text-center">
          {error?.message ?? 'This product could not be loaded.'}
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const totalStock = stockLevels?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        className="bg-background flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
        
        {/* Header */}
        <View className="flex-row items-center gap-x-2 px-4 pt-6 pb-2">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
            <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
          </Button>
        </View>

        <View className="px-6 pb-4">
          <Badge variant={product.isActive === false ? 'destructive' : 'default'} className="mb-2 self-start">
            <Text>{product.isActive === false ? 'INACTIVE' : 'ACTIVE'}</Text>
          </Badge>
          <Text className="text-foreground text-3xl font-black tracking-tight uppercase">
            {product.name}
          </Text>
          <Text className="text-muted-foreground text-lg font-medium">
            {product.code || 'NO CODE'}
          </Text>
        </View>

        {/* Tab Pills */}
        <View className="mb-4 px-6">
          <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
            {['overview', 'logs', 'recipe'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-lg py-2 ${
                  activeTab === tab ? 'bg-card shadow-sm' : ''
                }`}>
                <Text
                  className={`text-xs font-semibold capitalize ${
                    activeTab === tab ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <View className="gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="gap-4">
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground">Unit</Text>
                    <Text className="text-foreground font-medium uppercase">{product.unit}</Text>
                  </View>
                  <Separator />
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground">Cost Per Unit</Text>
                    <Text className="text-foreground font-medium">₹{product.costPerUnit?.$numberDecimal}</Text>
                  </View>
                  <Separator />
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground">Sales Price</Text>
                    <Text className="text-foreground font-medium">₹{product.salesPrice?.$numberDecimal}</Text>
                  </View>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <View>
                    <CardTitle>Current Stock</CardTitle>
                    <CardDescription>Total: {totalStock} units</CardDescription>
                  </View>
                  <Button size="sm" variant="outline" onPress={() => setAdjustModalVisible(true)}>
                    <Text>Adjust Stock</Text>
                  </Button>
                </CardHeader>
                <CardContent>
                  {stockPending ? (
                    <ActivityIndicator size="small" />
                  ) : stockLevels && stockLevels.length > 0 ? (
                    stockLevels.map((item) => (
                      <View key={item.locationId} className="border-b border-border py-2 last:border-0 flex-row justify-between items-center">
                        <View>
                          <Text className="text-foreground font-medium">{item.locationName}</Text>
                          <Text className="text-muted-foreground text-[10px] uppercase">ID: {item.locationId.slice(-6)}</Text>
                        </View>
                        <Text className={`font-bold ${item.quantity > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {item.quantity}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-muted-foreground text-sm">No stock across locations.</Text>
                  )}
                </CardContent>
              </Card>
            </View>
          )}

          {/* LOGS */}
          {activeTab === 'logs' && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Log</CardTitle>
                <CardDescription>Recent movements for this product</CardDescription>
              </CardHeader>
              <CardContent>
                {logsPending ? (
                  <ActivityIndicator size="small" />
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <View key={log._id} className="border-b border-border py-3 last:border-0">
                      <View className="flex-row justify-between mb-1">
                        <Text className="font-semibold text-foreground capitalize">{log.purpose}</Text>
                        <Text className={`font-bold ${log.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {log.quantity > 0 ? '+' : ''}{log.quantity}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground text-xs">{log.location?.name || 'Unknown Location'}</Text>
                        <Text className="text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</Text>
                      </View>
                      <Text className="text-muted-foreground text-[10px] mt-1">Ref: {log.referenceModel} | By: {log.createdBy?.name || 'System'}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-muted-foreground text-sm">No recent movements.</Text>
                )}
              </CardContent>
            </Card>
          )}

          {/* RECIPE */}
          {activeTab === 'recipe' && (
            <Card>
              <CardHeader>
                <CardTitle>Recipe</CardTitle>
                <CardDescription>Required Raw Materials</CardDescription>
              </CardHeader>
              <CardContent>
                {product.rawMaterials && product.rawMaterials.length > 0 ? (
                  product.rawMaterials.map((rm) => (
                    <View key={rm._id} className="border-b border-border py-2 last:border-0 flex-row justify-between items-center">
                      <View>
                        <Text className="text-foreground font-medium">{rm.material?.name || 'Unknown Material'}</Text>
                        <Text className="text-muted-foreground text-xs">{rm.material?.code || ''}</Text>
                      </View>
                      <Text className="text-foreground font-bold">{rm.quantity}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-muted-foreground text-sm">No raw materials specified.</Text>
                )}
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Adjust Stock Modal */}
      <Modal visible={adjustModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-card rounded-xl p-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Adjust Stock</Text>
            
            <Text className="text-muted-foreground text-sm mb-1">Quantity (Use - for reduction)</Text>
            <TextInput
              className="border border-border bg-background text-foreground rounded-lg p-3 mb-4"
              keyboardType="numeric"
              placeholder="e.g. 5 or -2"
              value={adjustForm.quantity}
              onChangeText={(val) => setAdjustForm({...adjustForm, quantity: val})}
            />

            <Text className="text-muted-foreground text-sm mb-1">Location ID</Text>
            <TextInput
              className="border border-border bg-background text-foreground rounded-lg p-3 mb-4"
              placeholder="Paste exact Location ID"
              value={adjustForm.location}
              onChangeText={(val) => setAdjustForm({...adjustForm, location: val})}
            />

            <Text className="text-muted-foreground text-sm mb-1">Reason</Text>
            <TextInput
              className="border border-border bg-background text-foreground rounded-lg p-3 mb-6"
              placeholder="Reason for adjustment"
              value={adjustForm.reason}
              onChangeText={(val) => setAdjustForm({...adjustForm, reason: val})}
            />

            <View className="flex-row justify-end gap-x-3">
              <Button variant="outline" onPress={() => setAdjustModalVisible(false)}>
                <Text>Cancel</Text>
              </Button>
              <Button 
                onPress={() => adjustMutation.mutate({ 
                  quantity: Number(adjustForm.quantity), 
                  reason: adjustForm.reason, 
                  location: adjustForm.location,
                  type: 'audit'
                })}
                disabled={adjustMutation.isPending || !adjustForm.quantity || !adjustForm.location}
              >
                <Text>{adjustMutation.isPending ? 'Saving...' : 'Save'}</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductManagePage;
