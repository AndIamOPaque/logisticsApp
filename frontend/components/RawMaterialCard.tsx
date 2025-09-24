import { View, Text, Image } from 'react-native'
import React from 'react'

const RawMaterialCard = ({ rawMaterial }) => {
  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-start p-4 my-2'>
      <View>
        <Text className='text-lg font-semibold '>{rawMaterial.name}</Text>
        <Text className='font-semibold '>Category: {rawMaterial.category}</Text>
        <Text className='font-semibold '>Cost: {rawMaterial.costPerUnit}</Text>
      </View>
    </View>
  )
}

export default RawMaterialCard
