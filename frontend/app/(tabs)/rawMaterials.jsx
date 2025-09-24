import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import RawMaterialCard from '@/components/RawMaterialCard'

const rawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState([]);

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const response = await fetch('http://10.248.142.105:5000/api/raw-material');
        const data = await response.json();
        setRawMaterials(data);
      } catch (error) {
        console.error('Error fetching raw materials:', error);
      }
    };

    fetchRawMaterials();
  }, []);

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text>Raw Materials</Text>
        <FlatList
          data={rawMaterials}
          renderItem={({ item }) => <RawMaterialCard rawMaterial={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default rawMaterials
