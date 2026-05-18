import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CameraIcon, CheckIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fetchParties } from '@/api/party';
import { fetchEmployees } from '@/api/employee';
import { createBill, uploadFile } from '@/api/bill';
import { ThemedSelect } from '@/components/ui/themed-select';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateBillPage() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Form State
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [status, setStatus] = useState('PAID');
  const [partyId, setPartyId] = useState(null);
  const [partyModel, setPartyModel] = useState('Party');
  const [photoUri, setPhotoUri] = useState(null);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch Parties for the dropdown/selection
  const { data: partyData } = useQuery({
    queryKey: ['parties'],
    queryFn: () => fetchParties({ limit: 100 }),
  });
  const { data: empData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => fetchEmployees({ limit: 100 }),
  });
  
  const parties = partyData?.data?.parties || (Array.isArray(partyData?.data) ? partyData.data : []);
  const employees = empData?.data || [];

  const combinedOptions = [
    ...parties.map(p => ({ label: `(Party) ${p.name}`, value: `Party|${p._id}` })),
    ...employees.map(e => ({ label: `(Employee) ${e.name}`, value: `Employee|${e._id}` }))
  ];

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Camera permissions needed' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!category || !amount || !partyId) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill category, amount, and select a party' });
      return;
    }

    setLoading(true);
    try {
      let attachment = null;
      if (photoUri) {
        const uploadRes = await uploadFile(photoUri);
        if (uploadRes.success) {
          attachment = {
            url: uploadRes.data.url,
            fileType: uploadRes.data.fileType,
            caption: 'Receipt',
          };
        }
      }

      const [modelType, id] = partyId.split('|');
      const selectedEntity = modelType === 'Party' 
        ? parties.find(p => p._id === id)
        : employees.find(e => e._id === id);

      const billData = {
        type,
        category,
        paymentMethod,
        status,
        paymentDate: new Date(),
        dueDate,
        notes,
        items: [
          {
            name: category,
            price: Number(amount),
            quantity: 1,
          }
        ],
        from: type === 'EXPENSE' 
          ? { model: 'User', party: '6962456fb8324d04c3c77a95', name: 'Self' }
          : { model: modelType, party: selectedEntity._id, name: selectedEntity.name },
        to: type === 'EXPENSE'
          ? { model: modelType, party: selectedEntity._id, name: selectedEntity.name }
          : { model: 'User', party: '6962456fb8324d04c3c77a95', name: 'Self' },
      };

      if (attachment) {
        billData.attachments = [attachment];
      }

      await createBill(billData);
      qc.invalidateQueries({ queryKey: ['bills'] });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Bill created successfully!' });
      router.back();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 py-3">
        <View className="flex-row items-center gap-x-2">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-lg h-8 w-8">
            <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
          </Button>
          <Text className="text-foreground text-lg font-bold">New Bill</Text>
        </View>
        <Button size="sm" onPress={handleSave} disabled={loading} className="px-4">
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-primary-foreground font-bold">Save</Text>}
        </Button>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Type Toggle */}
        <View className="flex-row rounded-lg bg-muted p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 rounded-md py-2 items-center ${type === 'EXPENSE' ? 'bg-background shadow-sm' : ''}`}
            onPress={() => setType('EXPENSE')}>
            <Text className={`font-semibold ${type === 'EXPENSE' ? 'text-destructive' : 'text-muted-foreground'}`}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-md py-2 items-center ${type === 'INCOME' ? 'bg-background shadow-sm' : ''}`}
            onPress={() => setType('INCOME')}>
            <Text className={`font-semibold ${type === 'INCOME' ? 'text-green-500' : 'text-muted-foreground'}`}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Details */}
        <View className="mb-4">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Category / Title</Text>
          <TextInput
            className="bg-card text-foreground border border-border rounded-lg px-4 py-3"
            placeholder="e.g., Office Supplies, Fuel, Services..."
            placeholderTextColor="#888"
            value={category}
            onChangeText={setCategory}
          />
        </View>

        <View className="mb-4">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Amount (₹)</Text>
          <TextInput
            className="bg-card text-foreground border border-border rounded-lg px-4 py-3 text-2xl font-bold"
            placeholder="0.00"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View className="mb-6 z-10">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Select Party / Employee</Text>
          <ThemedSelect
            items={combinedOptions}
            value={partyId}
            onValueChange={setPartyId}
            placeholder="Select a recipient/sender..."
          />
        </View>

        {/* Status */}
        <View className="mb-6">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Status</Text>
          <View className="flex-row gap-2">
            {['PENDING', 'PAID'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                className={`border rounded-full px-4 py-2 ${status === s ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}>
                <Text className={status === s ? 'text-background font-bold text-xs' : 'text-foreground text-xs'}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <View className="mb-6">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Due Date</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className="bg-card border border-border rounded-lg px-4 py-3">
            <Text className="text-foreground">{dueDate.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
            />
          )}
        </View>

        {/* Notes */}
        <View className="mb-4">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Notes</Text>
          <TextInput
            className="bg-card text-foreground border border-border rounded-lg px-4 py-3"
            placeholder="Additional notes..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Payment Method</Text>
          <View className="flex-row flex-wrap gap-2">
            {['CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT_CARD'].map(pm => (
              <TouchableOpacity
                key={pm}
                onPress={() => setPaymentMethod(pm)}
                className={`border rounded-full px-4 py-2 ${paymentMethod === pm ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}>
                <Text className={paymentMethod === pm ? 'text-background font-bold text-xs' : 'text-foreground text-xs'}>{pm.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo Upload */}
        <View className="mb-6">
          <Text className="text-muted-foreground text-xs font-bold uppercase mb-2">Receipt Photo</Text>
          <TouchableOpacity
            onPress={handlePickImage}
            className="border-2 border-dashed border-border bg-card rounded-lg h-32 items-center justify-center overflow-hidden">
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <>
                <Icon as={CameraIcon} className="text-muted-foreground size-8 mb-2" />
                <Text className="text-muted-foreground font-medium">Tap to add photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
