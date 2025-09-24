import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmployeeCard from '@/components/employeeCard'
import { Link } from 'expo-router'

const employee = () => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://10.248.142.105:5000/api/employee');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await fetch(`http://10.248.142.105:5000/api/employee/${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Success', 'Employee deleted successfully');
        fetchEmployees(); // Refetch employees to update the list
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView className='px-5'>
      <View>
        <View className='flex flex-row justify-between items-center'>
          <Text className='text-2xl font-bold'>Employees</Text>
          <Link href="/add-employee" asChild>
            <TouchableOpacity className='bg-blue-500 p-2 rounded-lg'>
              <Text className='text-white'>Add Employee</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <FlatList
          data={employees}
          renderItem={({ item }) => <EmployeeCard employee={item} onDelete={handleDeleteEmployee} />}
          keyExtractor={(item) => item._id}
        />
      </View>
    </SafeAreaView>
  )
}

export default employee