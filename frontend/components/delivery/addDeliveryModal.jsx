import React, { useState } from 'react';
import { ModalToast } from '@/components/ui/modalToast';
import {
  View,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon, PlusIcon, Trash2Icon, Truck } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { createDelivery } from '@/api/delivery';
import api from '@/api/client';
import Toast from 'react-native-toast-message';

import { fetchLocations } from '@/api/location';
import { fetchParties } from '@/api/party';
import { fetchEmployees } from '@/api/employee';
import { fetchAssets } from '@/api/asset';
import { fetchProducts } from '@/api/product';
import { fetchRawMaterials } from '@/api/raw-material';

const UNIT_OPTIONS = []; // Deprecated, items have inherent units

export default function AddDeliveryModal({ visible, onClose }) {
  const qc = useQueryClient();
  const [direction, setDirection] = useState('in');
  const [partyId, setPartyId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [tripCost, setTripCost] = useState('');
  const [content, setContent] = useState([]); // { id: tempId, itemType, itemId, quantity }

  // Queries
  const { data: locationsRes } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const { data: partiesRes } = useQuery({ queryKey: ['parties'], queryFn: fetchParties });
  const { data: employeesRes } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
  const { data: assetsRes } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets });
  const { data: productsRes } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const { data: rawMaterialsRes } = useQuery({
    queryKey: ['raw-materials'],
    queryFn: fetchRawMaterials,
  });

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: createDelivery,
    meta: { successMessage: 'Delivery created successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setDirection('in');
    setPartyId('');
    setLocationId('');
    setToLocationId('');
    setVehicleId('');
    setDriverId('');
    setTripCost('');
    setContent([]);
  };

  const handleAddContent = () => {
    setContent([
      ...content,
      { id: Date.now().toString(), itemType: 'RawMaterial', itemId: '', quantity: '' },
    ]);
  };

  const handleRemoveContent = (id) => {
    setContent(content.filter((c) => c.id !== id));
  };

  const handleContentChange = (id, field, value) => {
    setContent((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleTypeChange = (id, newType) => {
    setContent((prev) =>
      prev.map((c) => (c.id === id ? { ...c, itemType: newType, itemId: '' } : c))
    );
  };

  const handleSubmit = () => {
    const payload = {
      direction,
      locationId,
      ...(direction === 'transfer'
        ? { toLocationId }
        : { [direction === 'in' ? 'supplierId' : 'buyerId']: partyId || undefined }),
      vehicleId: vehicleId || undefined,
      driverId: driverId || undefined,
      tripCost: tripCost ? Number(tripCost) : 0,
      content: content.map((c) => ({
        itemType: c.itemType,
        itemId: c.itemId,
        quantity: Number(c.quantity),
      })),
    };
    mutate(payload);
  };

  const isValid =
    locationId &&
    (direction === 'transfer' ? toLocationId : true) &&
    content.length > 0 &&
    content.every((c) => c.itemId && c.quantity);

  const locations = locationsRes?.data || [];
  const parties = partiesRes || [];
  const employees = employeesRes?.data || [];
  const assets = assetsRes?.data || [];
  const products = productsRes || [];
  const rawMaterials = rawMaterialsRes?.data || [];

  const locOptions = locations.map((l) => ({ label: l.name, value: l._id }));
  const partyOptions = parties
    .filter((p) => {
      if (direction === 'in') return p.type === 'supplier' || p.type === 'both';
      return p.type === 'buyer' || p.type === 'both';
    })
    .map((p) => ({ label: p.name, value: p._id }));
  const employeeOptions = employees
    .filter((e) => e.role === 'driver' || e.role === 'worker')
    .map((e) => ({ label: e.name, value: e._id }));
  const vehicleOptions = assets
    .filter((a) => a.category === 'vehicle')
    .map((a) => ({ label: a.name, value: a._id }));

  const getItemOptions = (type) => {
    if (type === 'Product') {
      return products.map((p) => ({ label: p.name, value: p._id }));
    }
    return rawMaterials.map((r) => ({ label: r.name, value: r._id }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="bg-background flex-1">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <View className="flex-row items-center gap-2">
              <Icon as={Truck} className="text-primary size-5" />
              <Text className="text-foreground text-lg font-bold">New Delivery</Text>
            </View>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          {isError && (
            <View className="px-4 pt-4">
              <ErrorMessage error={error} />
            </View>
          )}

          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20, gap: 20 }}
            keyboardShouldPersistTaps="handled">
            {/* Direction */}
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Direction *</Text>
              <View className="flex-row gap-x-2">
                <Button
                  className="flex-1"
                  variant={direction === 'in' ? 'default' : 'outline'}
                  onPress={() => {
                    setDirection('in');
                    setPartyId('');
                    setToLocationId('');
                  }}>
                  <Text
                    className={direction === 'in' ? 'text-primary-foreground' : 'text-foreground'}>
                    Inbound
                  </Text>
                </Button>
                <Button
                  className="flex-1"
                  variant={direction === 'out' ? 'default' : 'outline'}
                  onPress={() => {
                    setDirection('out');
                    setPartyId('');
                    setToLocationId('');
                  }}>
                  <Text
                    className={direction === 'out' ? 'text-primary-foreground' : 'text-foreground'}>
                    Outbound
                  </Text>
                </Button>
                <Button
                  className="flex-1"
                  variant={direction === 'transfer' ? 'default' : 'outline'}
                  onPress={() => {
                    setDirection('transfer');
                    setPartyId('');
                    setToLocationId('');
                  }}>
                  <Text
                    className={
                      direction === 'transfer' ? 'text-primary-foreground' : 'text-foreground'
                    }>
                    Transfer
                  </Text>
                </Button>
              </View>
            </View>

            {/* Location & Party */}
            <View className="flex-row gap-x-3">
              {direction === 'transfer' ? (
                <>
                  <View className="flex-1 gap-y-1.5">
                    <Text className="text-foreground text-sm font-medium">From Location *</Text>
                    <ThemedSelect
                      items={locOptions}
                      value={locationId}
                      onValueChange={setLocationId}
                      placeholder="Select Source"
                    />
                  </View>
                  <View className="flex-1 gap-y-1.5">
                    <Text className="text-foreground text-sm font-medium">To Location *</Text>
                    <ThemedSelect
                      items={locOptions}
                      value={toLocationId}
                      onValueChange={setToLocationId}
                      placeholder="Select Destination"
                    />
                  </View>
                </>
              ) : (
                <>
                  <View className="flex-1 gap-y-1.5">
                    <Text className="text-foreground text-sm font-medium">Location *</Text>
                    <ThemedSelect
                      items={locOptions}
                      value={locationId}
                      onValueChange={setLocationId}
                      placeholder="Select Location"
                    />
                  </View>
                  <View className="flex-1 gap-y-1.5">
                    <Text className="text-foreground text-sm font-medium">
                      {direction === 'in' ? 'Supplier' : 'Buyer'}
                    </Text>
                    <ThemedSelect
                      items={partyOptions}
                      value={partyId}
                      onValueChange={setPartyId}
                      placeholder={`Select ${direction === 'in' ? 'Supplier' : 'Buyer'}`}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Logistics */}
            <View className="bg-muted/30 border-border gap-y-3 rounded-xl border p-4">
              <Text className="text-muted-foreground mb-1 text-xs font-bold tracking-widest uppercase">
                Logistics & Finance
              </Text>
              <View className="flex-row gap-x-3">
                <View className="flex-1 gap-y-1.5">
                  <Text className="text-foreground text-sm font-medium">Driver</Text>
                  <ThemedSelect
                    items={employeeOptions}
                    value={driverId}
                    onValueChange={setDriverId}
                    placeholder="Select Driver"
                  />
                </View>
                <View className="flex-1 gap-y-1.5">
                  <Text className="text-foreground text-sm font-medium">Vehicle</Text>
                  <ThemedSelect
                    items={vehicleOptions}
                    value={vehicleId}
                    onValueChange={setVehicleId}
                    placeholder="Select Vehicle"
                  />
                </View>
              </View>
              <View className="mt-2 gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Trip Cost (₹)</Text>
                <Input
                  placeholder="e.g. 500"
                  keyboardType="numeric"
                  value={tripCost}
                  onChangeText={setTripCost}
                />
              </View>
            </View>

            {/* Content List */}
            <View className="gap-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-sm font-medium">
                  Items ({content.length}) *
                </Text>
                <Button size="sm" variant="outline" onPress={handleAddContent}>
                  <Icon as={PlusIcon} className="text-foreground mr-1 size-4" />
                  <Text>Add Item</Text>
                </Button>
              </View>

              {content.length === 0 ? (
                <View className="border-border items-center justify-center rounded-xl border border-dashed py-6">
                  <Text className="text-muted-foreground text-sm">
                    No items added to this delivery.
                  </Text>
                </View>
              ) : (
                <View className="gap-y-3">
                  {content.map((item, index) => (
                    <View
                      key={item.id}
                      className="bg-card border-border gap-y-3 border p-3"
                      style={{ borderRadius: 12 }}>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-muted-foreground text-xs font-bold">
                          ITEM #{index + 1}
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveContent(item.id)}>
                          <Icon as={Trash2Icon} className="text-destructive size-4" />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row gap-x-2">
                        <View className="flex-1 gap-y-1.5">
                          <Text className="text-foreground text-xs font-medium">Type</Text>
                          <ThemedSelect
                            items={[
                              { label: 'Raw Material', value: 'RawMaterial' },
                              { label: 'Product', value: 'Product' },
                            ]}
                            value={item.itemType}
                            onValueChange={(val) => handleTypeChange(item.id, val)}
                          />
                        </View>
                        <View className="flex-[2] gap-y-1.5">
                          <Text className="text-foreground text-xs font-medium">Item Name *</Text>
                          <ThemedSelect
                            items={getItemOptions(item.itemType)}
                            value={item.itemId}
                            onValueChange={(val) => handleContentChange(item.id, 'itemId', val)}
                            placeholder="Select Item"
                          />
                        </View>
                      </View>

                      <View className="flex-row gap-x-2">
                        <View className="flex-[2] gap-y-1.5">
                          <Text className="text-foreground text-xs font-medium">Quantity *</Text>
                          <Input
                            placeholder="Qty"
                            keyboardType="numeric"
                            value={item.quantity}
                            onChangeText={(v) => handleContentChange(item.id, 'quantity', v)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="border-border border-t p-4">
            <Button onPress={handleSubmit} disabled={isPending || !isValid} className="w-full">
              <Text>{isPending ? 'Creating...' : 'Create Delivery'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}
