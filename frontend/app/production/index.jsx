import React, { useState } from 'react'
import ProductionCard from '@/components/production/productionCard';
import { useQuery } from '@tanstack/react-query';
import { fetchProductions } from '@/api/production';
import { Text } from '@/components/ui/text';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import AddProductionModal from '@/components/production/addProductionModal';

const ProductionPage = () => {
    const[showAddProductionModal, setShowAddProductionModal] = useState(false);
    const [search, setSearch] = useState();
const {data : productions, isPending, error} = useQuery({
    queryFn: () => fetchProductions({search}),
    queryKey:['production', search],
  });
  if (isPending) return ( <View className="flex-1 justify-center items-center bg-background">
          <ActivityIndicator size="large" />
        </View>)
  if (error) return <Text>Error: {error.message}</Text>;
  console.log("Production Page:", productions); 

  return (
    <>
      <Stack.Screen options={{headerRight: ()=> <AddProduction toggleModal={() => setShowAddProductionModal(true)}/>}} />
    <ScrollView showsHorizontalScrollIndicator={false}>
      {productions?.map((production) =>{
        console.log('production', production);   
        return(
          <ProductionCard key={production._id} production={production}/>)
      })}
    </ScrollView>
    <AddProductionModal
      visible ={showAddProductionModal}
      onClose ={() => setShowAddProductionModal(false)} 
    />
    </>
  )
}

const AddProduction = ({toggleModal}) =>{
   return (
    <Button
      onPressIn={toggleModal}
      size="icon"
      variant="ghost"
      className="ios:size-9 web:mx-4 rounded-full">
      <Icon as={PlusCircle} />
    </Button>
  );
}

export default ProductionPage