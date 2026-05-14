import { View, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ModalToast } from '@/components/ui/modalToast';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { recordProductionOutput } from '@/api/production'; // Adjust import to your actual API file

const ProductionOutputModal = ({ order, visible, onClose }) => {
  const [quantity, setQuantity] = useState('');
  const queryClient = useQueryClient();

  const isFormValid = quantity !== '' && Number(quantity) > 0;

  const mutation = useMutation({
    mutationFn: (qty) => recordProductionOutput(order._id, { quantityProduced: Number(quantity) }),
    onSuccess: (data) => {
      queryClient.setQueryData(['production', order._id], data);
      queryClient.invalidateQueries({ queryKey: ['production'], exact:false });
      queryClient.invalidateQueries({ queryKey: ['production', order._id],  exact:false });
      
      setQuantity('');
      onClose();
    },
    onError: (err) => {
      console.error("Production Log Failed:", err.message);
    }
  });

  const handleSubmit = () => {
    if (isFormValid) {
      console.log('production id', order._id);
      mutation.mutate(quantity);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-card p-6 rounded-t-3xl gap-y-6 shadow-xl">
          
          {/* Header */}
          <View>
            <Text className="text-foreground text-2xl font-black uppercase tracking-tight">
              Log Production
            </Text>
            <Text className="text-muted-foreground text-sm">
              Current Progress: {order?.quantityProduced || 0} / {order?.quantityToProduce}
            </Text>
          </View>

          {/* Input Field */}
          <View className="gap-y-2">
            <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">
              Quantity Produced (Units)
            </Text>
            <TextInput 
              placeholder="Enter unit count..." 
              className="bg-muted p-5 rounded-2xl text-foreground text-lg font-bold border border-border"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />
          </View>

          {/* Efficiency Quick-Select (Optional - based on common batches) */}
          <View className="flex-row gap-2">
             {[10, 50, 100].map(val => (
               <TouchableOpacity 
                key={val}
                onPress={() => setQuantity(val.toString())}
                className="bg-secondary px-4 py-2 rounded-full"
               >
                 <Text className="text-secondary-foreground font-bold">+{val}</Text>
               </TouchableOpacity>
             ))}
          </View>

          {/* Actions */}
          <View className="flex-row gap-x-3 mt-2">
            <Button 
              variant="outline" 
              className="flex-1 h-14" 
              onPress={() => {
                setQuantity('');
                onClose();
              }}
            >
              <Text>Cancel</Text>
            </Button>
            
            <TouchableOpacity 
              className={`flex-2 h-14 rounded-md justify-center items-center ${isFormValid ? 'bg-primary' : 'bg-muted opacity-50'}`}
              onPress={handleSubmit}
              disabled={!isFormValid || mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary-foreground font-bold text-lg">Confirm Entry</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    <ModalToast />
    </Modal>
  );
};

export default ProductionOutputModal;