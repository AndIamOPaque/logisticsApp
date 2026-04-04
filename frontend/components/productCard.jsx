import { View, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { Text } from '@/components/ui/text';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStockLevels, correctStock } from '@/api/product.js';

const ProductCard = ({ product , onAdjustStock}) => {
  const [showStock, setShowStock] = useState(false);
    const { data: stockData, isPending, isError } = useQuery({
      queryKey: ['stockLevels', product._id],
      queryFn: () => getStockLevels(product._id),
      enabled: showStock,
    });
  
 
  const totalStock = stockData?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0;

  return (
    <View className="bg-card border-b border-border">
      <TouchableOpacity 
        className="p-4"
        onPress={() => setShowStock(!showStock)}
      >
        <Text className="text-foreground font-bold text-lg">{product.name}</Text>
        <Text className="text-muted-foreground">
          Cost: {product.costPerUnit.$numberDecimal}
        </Text>
        <Text className="text-muted-foreground">
          Price: {String(product.salesPrice.$numberDecimal)}
        </Text>
        {showStock && (
        <View className="p-4">
  <View className="mt-3 p-3 bg-muted rounded-lg border border-border">
    {isPending ? (
      <ActivityIndicator size="small" className="text-primary" />
    ) : isError ? (
      <Text className="text-destructive text-xs italic">Error loading stock</Text>
    ) : stockData && stockData.length > 0 ? (
      <View className="gap-y-2">
        {stockData.map((item) => (
          <View 
            key={item.locationId} 
            className="flex-row justify-between items-center border-b border-border/50 pb-1 last:border-0"
          >
            <View>
              <Text className="text-foreground font-medium text-sm">
                {item.locationName}
              </Text>
              <Text className="text-muted-foreground text-[10px] uppercase tracking-wider">
                ID: {item.locationId.slice(-6)} 
              </Text>
            </View>
            
            <View className="items-end">
              <Text className={`font-bold ${item.quantity > 0 ? 'text-primary' : 'text-destructive'}`}>
                {item.quantity}
              </Text>
              <Text className="text-muted-foreground text-[10px]">UNITS</Text>
            </View>
          </View>
        ))}
      </View>
    ) : (
      <Text className="text-muted-foreground text-xs italic text-center">
        No stock records found.
      </Text>
    )}
    <View className="mt-2 pt-2 border-t border-border flex-row justify-between items-center">
  <View>
    <Text className="text-foreground font-bold text-sm">Total Inventory</Text>
    <Text className="text-muted-foreground text-[10px]">ALL LOCATIONS</Text>
  </View>
  
  <View className="items-end">
    <Text className="text-foreground font-black text-lg">
      {totalStock}
    </Text>
    <Text className="text-muted-foreground text-[10px]">TOTAL UNITS</Text>
  </View>
</View>
  </View>
          
          <TouchableOpacity 
            className="mt-4 bg-primary p-3 rounded-md items-center"
            onPress={onAdjustStock}
          >
            <Text className="text-primary-foreground font-bold">Adjust Stock</Text>
          </TouchableOpacity>
        </View>
)}
      </TouchableOpacity>
      
    </View>
  );
};

export default ProductCard;