import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import React, { useState } from 'react';
import { router } from 'expo-router';

const ProductionCard = ({ production }) => {
  const [expanded, setExpanded] = useState(false);

  if (!production?.product) {
    console.error("Critical Data Missing: Production order lacks product details", production?._id);
    return null;
  }

  const dateObj = new Date(production.createdAt || Date.now());
  const dateDisplay = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeDisplay = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-primary';
      case 'in_progress': return 'text-chart-2'; 
      case 'pending': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const percentComplete = production.quantityToProduce > 0 
    ? Math.round((production.quantityProduced / production.quantityToProduce) * 100) 
    : 0;

  return (
    <View className="bg-card border-b border-border">
      <TouchableOpacity 
        className="p-4"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-1">
          <View>
             <Text className="text-primary font-bold text-xs uppercase tracking-widest">
              {dateDisplay}
            </Text>
            <Text className="text-muted-foreground text-[10px]">
              {timeDisplay}
            </Text>
          </View>
          
          <View className="bg-muted px-2 py-1 rounded-sm">
            <Text className={`font-bold text-[10px] uppercase ${getStatusColor(production.status)}`}>
              {production.status || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <View className="mt-1">
          <Text className="text-foreground font-black text-xl leading-tight">
            {production.product.name}
          </Text>
          <Text className="text-muted-foreground text-xs mt-0.5">
            {production.product.code || 'NO-CODE'} • {production.location?.name || 'Unassigned Location'}
          </Text>
        </View>

        <View className="flex-row justify-between items-end mt-4">
          <View>
             <Text className="text-muted-foreground text-[10px] uppercase font-bold">Progress</Text>
             <Text className="text-foreground font-medium text-sm">
               {production.quantityProduced} <Text className="text-muted-foreground">/ {production.quantityToProduce} Units</Text>
             </Text>
          </View>
          <Text className="text-foreground font-bold text-2xl">
            {percentComplete}%
          </Text>
        </View>

        {expanded && (
          <View className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-1">
            
            {production.notes && (
              <View className="bg-muted/50 p-3 rounded-md mb-3">
                <Text className="text-xs text-muted-foreground italic">
                  {production.notes}
                </Text>
              </View>
            )}

            <View className="gap-y-2">
               <View className="flex-row justify-between">
                 <Text className="text-muted-foreground text-xs">Order ID</Text>
                 <Text className="text-foreground text-xs font-mono">{production._id}</Text>
               </View>
               <View className="flex-row justify-between">
                 <Text className="text-muted-foreground text-xs">Requested By</Text>
                 <Text className="text-foreground text-xs">{production.createdBy?.name || 'System'}</Text>
               </View>
               <View className="flex-row justify-between">
                 <Text className="text-muted-foreground text-xs">Materials Logged</Text>
                 <Text className="text-foreground text-xs">
                   {production.consumedMaterials?.length || 0} Records
                 </Text>
               </View>
            </View>

            <TouchableOpacity className="mt-4 bg-primary p-3 rounded-md items-center"
            onPress={()=>router.push(`/production/${production._id}`)}>
              <Text className="text-primary-foreground font-bold text-sm">
                Manage Production
              </Text>
            </TouchableOpacity>

          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProductionCard;