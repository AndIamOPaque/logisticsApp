import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BillCard from '@/components/BillCard'

const bills = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch('http://10.248.142.105:5000/api/bill');
        const data = await response.json();
        setBills(data);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };

    fetchBills();
  }, []);

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text>Bills</Text>
        <FlatList
          data={bills}
          renderItem={({ item }) => <BillCard bill={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default bills
