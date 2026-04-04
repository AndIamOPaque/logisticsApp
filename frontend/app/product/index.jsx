import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { use, useState} from 'react';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import { fetchProducts } from '@/api/product';
import { useQuery } from '@tanstack/react-query';
import {fetchLocations} from '@/api/location';
import ProductCard from '@/components/productCard';
import StockAdjustmentModal from '@/components/stockAdjustmentModal';


export default function ProductPage() {
  const [search, setSearch] = useState('');
  const[selectedProduct, setSelectedProduct] = useState(null);
  const {data: products, isPending: isProductPending, error: productError} = useQuery({
    queryFn: () => fetchProducts({search}),
    queryKey:['products', search],
    staleTime: 100*60*60,
  });
  const {data: locations, isPending: isLocationPending, error: locationError} = 
   useQuery({
    queryKey:['locations'],
    queryFn: ()=>fetchLocations(),
    staleTime: 10*60*60,
  });
  const tabBarHeight = useBottomTabBarHeight();
  

if (isProductPending) {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" className='text-accent-foreground' /> 
    </View>
  );
}
  console.log("ProductPage: ", products);
  if(locationError){
    console.log("error loading location", locationError);

  }
  if(productError){
    console.log("error loading products", productError);
  }
  console.log('location:', locations);
  return (
    <ScrollView showsVerticalScrollIndicator={false} 
    contentContainerStyle={{paddingBottom: tabBarHeight+46}}>
     <View>
      {products?.map((product) => (
        <ProductCard key={product._id} product={product} onAdjustStock={()=> setSelectedProduct(product)} />
      ))}
      </View>
      {!isLocationPending&&
      <StockAdjustmentModal 
        product={selectedProduct} 
        visible={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />}
    
    </ScrollView>
    
  )
}

