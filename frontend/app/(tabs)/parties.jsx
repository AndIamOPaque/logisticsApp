import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import PartyCard from '@/components/PartyCard'

const parties = () => {
  const [parties, setParties] = useState([]);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await fetch('http://10.248.142.105:5000/api/party');
        const data = await response.json();
        setParties(data);
      } catch (error) {
        console.error('Error fetching parties:', error);
      }
    };

    fetchParties();
  }, []);

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text>Parties</Text>
        <FlatList
          data={parties}
          renderItem={({ item }) => <PartyCard party={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default parties
