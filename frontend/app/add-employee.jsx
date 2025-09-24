import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const addEmployee = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('worker');
  const [wageAmount, setWageAmount] = useState('');
  const [wageType, setWageType] = useState('daily');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleAddEmployee = async () => {
    try {
      const response = await fetch('http://10.248.142.105:5000/api/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          role,
          wage: {
            amount: wageAmount,
            type: wageType,
          },
          contact: {
            phone,
          },
          joiningDate: new Date(),
          // createdBy should be the logged in user, hardcoding for now
          createdBy: '60d21b4667d0d8992e610c85'
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Employee added successfully');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text className='text-2xl font-bold mb-5'>Add Employee</Text>
        <TextInput
          className='border border-gray-300 p-2 rounded-lg mb-3'
          placeholder='Name'
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className='border border-gray-300 p-2 rounded-lg mb-3'
          placeholder='Role (worker, manager, driver, admin)'
          value={role}
          onChangeText={setRole}
        />
        <TextInput
          className='border border-gray-300 p-2 rounded-lg mb-3'
          placeholder='Wage Amount'
          value={wageAmount}
          onChangeText={setWageAmount}
          keyboardType='numeric'
        />
        <TextInput
          className='border border-gray-300 p-2 rounded-lg mb-3'
          placeholder='Wage Type (hourly, daily, weekly, monthly)'
          value={wageType}
          onChangeText={setWageType}
        />
        <TextInput
          className='border border-gray-300 p-2 rounded-lg mb-3'
          placeholder='Phone'
          value={phone}
          onChangeText={setPhone}
          keyboardType='phone-pad'
        />
        <Button title='Add Employee' onPress={handleAddEmployee} />
      </View>
    </SafeAreaView>
  )
}

export default addEmployee
