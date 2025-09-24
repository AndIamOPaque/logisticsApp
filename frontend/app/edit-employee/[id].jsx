import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'

const editEmployee = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [wageAmount, setWageAmount] = useState('');
  const [wageType, setWageType] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://10.248.142.105:5000/api/employee/${id}`);
        const data = await response.json();
        setName(data.name);
        setRole(data.role);
        setWageAmount(data.wage.amount.toString());
        setWageType(data.wage.type);
        setPhone(data.contact.phone);
      } catch (error) {
        console.error('Error fetching employee:', error);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleUpdateEmployee = async () => {
    try {
      const response = await fetch(`http://10.248.142.105:5000/api/employee/${id}`, {
        method: 'PUT',
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
          // updatedBy should be the logged in user, hardcoding for now
          updatedBy: '60d21b4667d0d8992e610c85'
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Employee updated successfully');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView className='px-5'>
      <View>
        <Text className='text-2xl font-bold mb-5'>Edit Employee</Text>
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
        <Button title='Update Employee' onPress={handleUpdateEmployee} />
      </View>
    </SafeAreaView>
  )
}

export default editEmployee