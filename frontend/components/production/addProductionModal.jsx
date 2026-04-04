import { View, Modal, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Text } from '../ui/text'
import { Button } from '../ui/button'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createProductionOrder } from '@/api/production'
import { fetchProducts } from '@/api/product'
import { fetchLocations } from '@/api/location'
import { ScrollableSelect } from '../ui/scrollable-select'
 
export const AddProductionModal = ({onClose, visible}) => {
    const queryClient = useQueryClient();
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const {data: products, isPending: isProductsPending, error: productsError} = useQuery({
      queryFn: ()=>fetchProducts(),
      queryKey: ['products'],
      staleTime: 10*60*60,
    });
    const {data: locations, isPending: isLocationPending, error: locationError} = 
   useQuery({
    queryKey:['locations'],
    queryFn: ()=>fetchLocations(),
    staleTime: 10*60*60,
  });
    const [form, setForm] = useState(
      {
      product: selectedProduct,
      location: selectedLocation,
      quantityToProduce: NaN,
      notes: '',
      date: new Date(),  
      }
    );
  const isFormValid = (form.product !== '' && form.location !== '' && !Number.isNaN(form.quantityToProduce));
  const mutation = useMutation({
        mutationFn: (form) => createProductionOrder(form),
        onSuccess: (data) =>{
      // queryClient.setQueryData(['production'], data);
      queryClient.invalidateQueries({ queryKey: ['production'], exact:false });    
      onClose();
        },
     onError: (err) => {
         onClose();
      console.error("Production Creation Failed:", err.message);
    }
    })
    const handlePress = (form) => {
        mutation.mutate(form);
    }
    if(isLocationPending || isProductsPending){
      return(
        <Modal visible={visible} animationType="slide" transparent>
          <ActivityIndicator size="large" />
        </Modal>
      )
    }
    console.log('Products in add production', products.data);
  return (
     <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-card p-6 rounded-t-3xl gap-y-6 shadow-xl">
          
        <ScrollableSelect 
      items={products.data}
      valueKey='_id'
      labelKey='name'
      value={selectedProduct}
      onValueChange={(option) => setSelectedProduct(option?.value)}
      placeholder="Product"
      groupLabel="Fruits"
    />
          <View className="flex-row gap-2">
             {['completed', 'cancelled'].map(val => (
               <TouchableOpacity 
                key={val}
                onPress={() => handlePress(val) }
                className="bg-secondary px-4 py-2 rounded-full"
               >
                 <Text className="text-secondary-foreground font-bold">{val}</Text>
               </TouchableOpacity>
             ))}
          </View>

          {/* Actions */}
          <View className="flex-row gap-x-3 mt-2">
            <Button 
              variant="outline" 
              className="flex-1 h-14" 
              onPress={() => {
                onClose();
              }}
            >
              <Text>Cancel</Text>
            </Button>
          </View>

        </View>
      </View>
    </Modal>
  )
}

export default AddProductionModal