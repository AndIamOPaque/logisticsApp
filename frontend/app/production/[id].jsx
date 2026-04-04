import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router'; 
import { useQuery } from '@tanstack/react-query';
import { Settings, Printer, Box, AlertTriangle, CheckCircle2, Clock } from 'lucide-react-native';
import ConfirmDialog from '@/components/confirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchProductionById } from '@/api/production';
import ProductionOutputModal from '@/components/production/productionOutputModal';
import { useMutation } from '@tanstack/react-query';
import { changeProductionStatus } from '@/api/production';

const ProductionManagePage = () => {
  const { id } = useLocalSearchParams();
  const [outputModalVisble, setOutputModalVisble] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  console.log('Production ID is', id);

  const [confirmConfig, setConfirmConfig] = React.useState(null);
  
  const mutation = useMutation({
        mutationFn: (status) => changeProductionStatus(order._id, {status:status}),
        onSuccess: (data) =>{
      queryClient.setQueryData(['production', order._id], data);
      queryClient.invalidateQueries({ queryKey: ['production'], exact:false });
      queryClient.invalidateQueries({ queryKey: ['production', order._id],  exact:false });      
        },
     onError: (err) => {
      console.error("Staus Change Failed:", err.message);
    },
  });


  const askConfirmation = (message, title, variant = "default") => {
    return new Promise((resolve) => {
      setConfirmConfig({
        message,
        title,
        variant,
        resolve, 
      });
    });
  };

  const handleCloseOrder = async (status) => {
    const confirmed = await askConfirmation(
      "Closing this order will move remaining materials to waste. Proceed?",
      `${status === "Complete" ? "Complete" : "Cancel"} Production Order`,
      "destructive"
    );

    if (!confirmed) return; 

    console.log(`Update production order status to ${status} `);
    mutation.mutate(status)
  };
  
  const { data: order, isPending, error } = useQuery({
    queryKey: ['production', id],
    queryFn: () => fetchProductionById(id),
    initialData: undefined, 
    staleTime: 1,
  });

  if (isPending) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <AlertTriangle size={48} className="text-destructive mb-4" />
        <Text className="text-xl font-bold text-foreground">Order Not Found</Text>
        <Text className="text-muted-foreground text-center mt-2">
          {error?.message || "The production order ID provided does not exist or could not be loaded."}
        </Text>
        <Button variant="outline" className="mt-6" onPress={() => router.back}>
          <Text>Return to Dashboard</Text>
        </Button>
      </View>
    );
  }

  const progress = order.quantityToProduce > 0 
    ? (order.quantityProduced / order.quantityToProduce) * 100 
    : 0;
    
  const getStatusVariant = (status) => {
    switch(status?.toLowerCase()) {
        case 'completed': return 'default'; // primary color
        case 'pending': return 'secondary';
        case 'cancelled': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
     
      <View className="p-6 pb-2">
        <View className="flex-row justify-between items-start">

          <View className="flex-1">
            <Badge variant={getStatusVariant(order.status)} className="self-start mb-2">
              <Text>{order.status || 'UNKNOWN'}</Text>
            </Badge>
            <Text className="text-3xl font-black text-foreground uppercase tracking-tight">
              {order.product?.name || 'Unknown Product'}
            </Text>
            <Text className="text-lg text-muted-foreground font-medium">
              {order.product?.code}
            </Text>
          </View>


        <DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="ghost" size="icon">
            <Settings size={24} className="text-muted-foreground" />
          </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      <TouchableOpacity variant="secondary" className="flex-1" 
      onPress={()=> handleCloseOrder("Complete")}
      >
              <Text>Complete</Text>
            </TouchableOpacity>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <TouchableOpacity variant="secondary" className="flex-1" 
      onPress={()=> handleCloseOrder("Cancelled")}
      >
              <Text>Cacncel</Text>
            </TouchableOpacity>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Text>Team</Text>
    </DropdownMenuItem> 
  </DropdownMenuContent>
        </DropdownMenu>

        </View>
      </View>

      {/* Primary KPI Card */}
      <View className="px-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Production Progress</CardTitle>
            <CardDescription>Target: {order.quantityToProduce} Units</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-end justify-between mb-2">
              <Text className="text-4xl font-black text-primary">
                {order.quantityProduced}
              </Text>
              <Text className="text-sm text-muted-foreground font-bold mb-1">
                {Math.round(progress)}% COMPLETE
              </Text>
            </View>
            <Progress value={progress} className="h-3" />
          </CardContent>
          <CardFooter className="flex-row gap-3 pt-2">
            <Button className="flex-1" onPress={()=> setOutputModalVisble(!outputModalVisble)}>
              <Printer size={16} className="text-primary-foreground mr-2" />
              <Text>Log Output</Text>
            </Button>
            
          </CardFooter>
        </Card>
      </View>

      {/* Main Content Tabs */}
      <View className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-row">
            <TabsTrigger value="overview" className="flex-1">
              <Text>Overview</Text>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex-1">
              <Text>Materials</Text>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <Text>History</Text>
            </TabsTrigger>
          </TabsList>

          {/* TAB: OVERVIEW */}
          <TabsContent value="overview" className="mt-4 gap-4">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">Location</Text>
                  <Text className="font-medium text-foreground ">{order.location?.name || 'N/A'}</Text>
                </View>
                <Separator />
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">Order ID</Text>
                  <Text className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">
                    {order._id}
                  </Text>
                </View>
                <Separator />
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">Created By</Text>
                  <View className="flex-row items-center gap-2">
                    <Avatar alt="User Avatar" className="w-6 h-6">
                         <AvatarFallback>
                            <Text>{order.createdBy?.name?.[0] || 'U'}</Text>
                         </AvatarFallback>
                    </Avatar>
                    <Text className="font-medium text-foreground">{order.createdBy?.name || 'System'}</Text>
                  </View>
                </View>
                 <Separator />
                 <View className="flex-col gap-1">
                  <Text className="text-muted-foreground mb-1">Notes</Text>
                  <View className="bg-muted/50 p-3 rounded-md">
                     <Text className="italic text-sm text-foreground">
                        {order.notes || "No notes provided for this order."}
                     </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Financial/Sales Context (Optional) */}
            <Card>
                <CardHeader>
                    <CardTitle>Financials</CardTitle>
                </CardHeader>
                <CardContent className="flex-row justify-between">
                    <View>
                        <Text className="text-muted-foreground text-xs uppercase">Est. Cost</Text>
                        <Text className="text-lg font-bold">
                             ₹{order.product?.costPerUnit?.$numberDecimal || '0.00'}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-muted-foreground text-xs uppercase">Target Value</Text>
                        <Text className="text-lg font-bold text-primary">
                             ₹{((parseFloat(order.product?.salesPrice?.$numberDecimal || 0)) * order.quantityToProduce).toFixed(2)}
                        </Text>
                    </View>
                </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: MATERIALS */}
          <TabsContent value="materials" className="mt-4">
            <Card>
              <CardHeader className="flex-row justify-between items-center">
                 <View>
                    <CardTitle>Material Consumption</CardTitle>
                    <CardDescription>Raw materials logged against this order</CardDescription>
                 </View>
                 <Button size="sm" variant="outline" onPress={() => console.log("Add Material")}>
                    <Text>+ Log</Text>
                 </Button>
              </CardHeader>
              <CardContent>
                {/* Fallback for empty list */}
                {(!order.consumedMaterials || order.consumedMaterials.length === 0) ? (
                    <View className="py-8 items-center">
                        <Box className="text-muted-foreground mb-2" size={32} />
                        <Text className="text-muted-foreground text-center">No materials consumed yet.</Text>
                    </View>
                ) : (
                    <View className="gap-2">
                        {/* Map your materials here */}
                        {order.consumedMaterials.map((mat, index) => (
                             <View key={index} className="flex-row justify-between items-center border-b border-border py-2 last:border-0">
                                <Text className="font-medium">{mat.materialName || `Material #${index + 1}`}</Text>
                                <Text className="font-bold">{mat.quantity} <Text className="text-muted-foreground text-xs font-normal">UNITS</Text></Text>
                            </View>
                        ))}
                    </View>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: HISTORY/LOGS (Placeholder) */}
          <TabsContent value="history" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="gap-4">
                    <View className="flex-row gap-3">
                         <Clock size={16} className="text-muted-foreground mt-1"/>
                         <View>
                             <Text className="font-medium text-sm">Order Created</Text>
                             <Text className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleString()}
                             </Text>
                         </View>
                    </View>
                    {/* Add more history items here */}
                </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </View>



      <>
      <ProductionOutputModal
        order={order}
        visible={outputModalVisble}
        onClose={()=> setOutputModalVisble(!outputModalVisble)}
      />
       <ConfirmDialog
        visible={!!confirmConfig}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        variant={confirmConfig?.variant}
        onConfirm={() => {
          confirmConfig?.resolve(true); // Resolve the promise with true
          setConfirmConfig(null);
        }}
        onCancel={() => {
          confirmConfig?.resolve(false); // Resolve the promise with false
          setConfirmConfig(null);
        }}
      />
      </>
    </ScrollView>

  );
};

export default ProductionManagePage;