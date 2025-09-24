import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProductCard from '@/components/ProductCard'

const products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://10.248.142.105:5000/api/product');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text>Products</Text>
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default products
