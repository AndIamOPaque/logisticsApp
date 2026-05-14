import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import React from 'react';
import { router } from 'expo-router';

const ProductCard = ({ product }) => {
  return (
    <View className="bg-card border-b border-border">
      <TouchableOpacity 
        className="p-4 flex-row items-center justify-between"
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <View>
          <Text className="text-foreground font-bold text-lg">{product.name}</Text>
          <Text className="text-muted-foreground mt-1">
            Cost: ₹{product.costPerUnit?.$numberDecimal || product.costPerUnit} | Price: ₹{product.salesPrice?.$numberDecimal || product.salesPrice}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;