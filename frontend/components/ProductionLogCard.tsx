import { View, Text, Image } from 'react-native'
import React from 'react'

const ProductionLogCard = ({ productionLog }) => {
  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-start p-4 my-2'>
      <View>
        <Text className='text-lg font-semibold '>{productionLog.product.name}</Text>
        <Text className='font-semibold '>Quantity: {productionLog.quantityProduced}</Text>
        <Text className='font-semibold '>Location: {productionLog.location.name}</Text>
      </View>
    </View>
  )
}

export default ProductionLogCard
