import { View, Text, Image } from 'react-native'
import React from 'react'

const ProductCard = ({ product }) => {
  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-start p-4 my-2'>
      <View>
        <Text className='text-lg font-semibold '>{product.name}</Text>
        <Text className='font-semibold '>Price: {product.salesPrice}</Text>
        <Text className='font-semibold '>Stock: {product.stock.packaged + product.stock.toBePackaged}</Text>
      </View>
    </View>
  )
}

export default ProductCard
