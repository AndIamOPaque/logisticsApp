import { View, Text, Image } from 'react-native'
import React from 'react'

const StockCard = ({ stockSnap }) => {
  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-start p-4 my-2'>
      <View>
        <Text className='text-lg font-semibold '>{stockSnap.item.name}</Text>
        <Text className='font-semibold '>Location: {stockSnap.location.name}</Text>
        <Text className='font-semibold '>Quantity: {stockSnap.quantity}</Text>
      </View>
    </View>
  )
}

export default StockCard
