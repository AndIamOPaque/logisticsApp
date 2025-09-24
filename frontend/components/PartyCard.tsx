import { View, Text, Image } from 'react-native'
import React from 'react'

const PartyCard = ({ party }) => {
  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-start p-4 my-2'>
      <View>
        <Text className='text-lg font-semibold '>{party.name}</Text>
        <Text className='font-semibold '>Type: {party.type}</Text>
      </View>
    </View>
  )
}

export default PartyCard
