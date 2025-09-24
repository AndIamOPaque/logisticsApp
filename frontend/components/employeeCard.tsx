import { View, Text , Image, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const EmployeeCard = ({ employee, onDelete }) => {

  const handleDelete = () => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(employee._id) },
      ]
    );
  }

  return (
    <View className='w-full rounded-2xl bg-white flex flex-row gap-4 justify-between items-center p-4 my-2'>
      <View className='flex flex-row gap-4 items-center'>
        <Image source={require('../assets/images/defaultProfile.png')} className='w-14 h-14 rounded-full'/>
        <View>
          <Text className='text-lg font-semibold '>{employee.name}</Text>      
          <Text className='font-semibold '>{employee.role}</Text>      
        </View>
      </View>
      <View className='flex flex-row gap-4'>
        <Link href={`/edit-employee/${employee._id}`} asChild>
          <TouchableOpacity>
            <Text className='text-blue-500'>Edit</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity onPress={handleDelete}>
          <Text className='text-red-500'>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default EmployeeCard