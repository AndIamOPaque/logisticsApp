import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fdfcf7' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',

            
        }}
      />
      <Tabs.Screen
        name="employee"
        options={{
          title: 'Employee',
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
        }}
      />
      <Tabs.Screen
        name="rawMaterials"
        options={{
          title: 'Raw Materials',
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
        }}
      />
      <Tabs.Screen
        name="production"
        options={{
          title: 'Production',
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Bills',
        }}
      />
      <Tabs.Screen
        name="parties"
        options={{
          title: 'Parties',
        }}
      />
    </Tabs>
  );
}
