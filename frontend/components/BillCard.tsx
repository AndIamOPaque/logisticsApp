import { View, Text, Image } from 'react-native'
import React from 'react'

const BillCard = ({ bill }) => {
  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-start p-4 my-2'>
      <View>
        <Text className='text-lg font-semibold '>{bill.category}</Text>
        <Text className='font-semibold '>From: {bill.from.name}</Text>
        <Text className='font-semibold '>To: {bill.to.name}</Text>
        <Text className='font-semibold '>Status: {bill.status}</Text>
      </View>
    </View>
  )
}

export default BillCard
