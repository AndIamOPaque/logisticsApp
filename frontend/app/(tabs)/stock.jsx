import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import StockCard from '@/components/StockCard'

const stock = () => {
  const [stockSnaps, setStockSnaps] = useState([]);

  useEffect(() => {
    const fetchStockSnaps = async () => {
      try {
        const response = await fetch('http://10.248.142.105:5000/api/stock-snap');
        const data = await response.json();
        setStockSnaps(data);
      } catch (error) {
        console.error('Error fetching stock snaps:', error);
      }
    };

    fetchStockSnaps();
  }, []);

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text>Stock</Text>
        <FlatList
          data={stockSnaps}
          renderItem={({ item }) => <StockCard stockSnap={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default stock
