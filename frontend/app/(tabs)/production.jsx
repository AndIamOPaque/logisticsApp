import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProductionLogCard from '@/components/ProductionLogCard'

const production = () => {
  const [productionLogs, setProductionLogs] = useState([]);

  useEffect(() => {
    const fetchProductionLogs = async () => {
      try {
        const response = await fetch('http://10.248.142.105:5000/api/production-log');
        const data = await response.json();
        setProductionLogs(data);
      } catch (error) {
        console.error('Error fetching production logs:', error);
      }
    };

    fetchProductionLogs();
  }, []);

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text>Production Logs</Text>
        <FlatList
          data={productionLogs}
          renderItem={({ item }) => <ProductionLogCard productionLog={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default production
