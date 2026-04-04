import { View, Text, Modal , TextInput, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native'
import React from 'react'
import { useMutation } from '@tanstack/react-query';
import { correctStock } from '@/api/product';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const StockAdjustmentModal = ({product, visible, onClose }) => {
    const [form, setForm] = useState({
    quantity: '',
    reason: '',
    type: 'count_error',
    location: '', 
    itemModel: 'Product' 
  });
    const queryClient = useQueryClient();
const isFormValid = 
  form.quantity !== '' && 
  form.reason.length >= 10 && 
  form.location !== '' && 
  form.type !== '';
    const mutation = useMutation({
    mutationFn: (newData) => correctStock(product._id, newData),
    meta: {
      successMessage: 'Stock adjusted successfully',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels', product._id] });
      onClose();
      setForm({ quantity: '', reason: '', type: 'count_error', location: '' });
    },
  });
    const {data: locations, isPending: isLocationLoading, error: locationError} = queryClient.getQueryData(['locations']);
    

 
   const handleSubmit = () => {
      mutation.mutate({
        ...form,
        quantity: Number(form.quantity),
        item: product._id,
        itemModel: 'Product', 
      });
    };
  return (
   <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-card p-6 rounded-t-3xl gap-y-4">
            <Text className="text-foreground text-xl font-bold">Adjust Stock:</Text>
            
            <TextInput 
              placeholder="Quantity (e.g. -5 or 10)" 
              className="bg-muted p-4 rounded-lg text-foreground"
              keyboardType="numeric"
              value={form.quantity}
              onChangeText={(val) => setForm({...form, quantity: val})}
            />

            <TextInput 
              placeholder="Reason (min 10 chars)" 
              className="bg-muted p-4 rounded-lg text-foreground"
              multiline
              value={form.reason}
              onChangeText={(val) => setForm({...form, reason: val})}
            />

<View>
  <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase">Select Location</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-x-2">
   {locations?.map((loc) => {
  console.log("Rendering location:", loc.name); 
  return (
    <TouchableOpacity
      key={loc._id}
      onPress={() => setForm({ ...form, location: loc._id })}
      className={`px-4 py-2 rounded-full border ${
        form.location === loc._id 
          ? 'bg-primary border-primary' 
          : 'bg-muted border-border'
      }`}
    >
      <Text className={form.location === loc._id ? 'text-primary-foreground font-bold' : 'text-foreground'}>
        {loc.name}
      </Text>
    </TouchableOpacity>
  );
})}
  </ScrollView>
</View>

<View>
  <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase">Adjustment Reason Type</Text>
  <View className="flex-row flex-wrap gap-2">
    {['wastage', 'theft', 'count_error', 'expiry', 'damanged'].map((type) => (
      <TouchableOpacity
        key={type}
        onPress={() => setForm({ ...form, type })}
        className={`px-3 py-1.5 rounded-md border ${
          form.type === type ? 'bg-primary/20 border-primary' : 'bg-muted border-border'
        }`}
      >
        <Text className={`capitalize text-xs ${form.type === type ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
          {type.replace('_', ' ')}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
            <View className="flex-row gap-x-2 mt-4">
              <TouchableOpacity 
                className="flex-1 bg-muted p-4 rounded-lg items-center"
                onPress={onClose}
              >
                <Text className="text-muted-foreground font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-2 p-4 rounded-lg items-center ${isFormValid ? 'bg-primary' : 'bg-muted opacity-50'}`}
  onPress={handleSubmit}
  disabled={!isFormValid || mutation.isPending}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-primary-foreground font-bold">Submit Correction</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  )
}

export default StockAdjustmentModal