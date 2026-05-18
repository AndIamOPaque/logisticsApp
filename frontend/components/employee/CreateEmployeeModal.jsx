import React, { useState } from 'react';
import { View, ScrollView, Modal, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { createEmployee } from '@/api/employee';
import { ModalToast } from '@/components/ui/modalToast';
import DateTimePicker from '@react-native-community/datetimepicker';

const ROLES = [
  { label: 'Worker', value: 'worker' },
  { label: 'Manager', value: 'manager' },
  { label: 'Driver', value: 'driver' },
  { label: 'Admin', value: 'admin' },
];

const WAGE_TYPES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Per Trip', value: 'per_trip' },
];

export default function CreateEmployeeModal({ visible, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    role: 'worker',
    phone: '',
    address: '',
    wageType: 'daily',
    wageAmount: '',
    notes: '',
    joiningDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: createEmployee,
    meta: { successMessage: 'Employee created successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      onClose();
      setForm({ name: '', role: 'worker', phone: '', address: '', wageType: 'daily', wageAmount: '', joiningDate: new Date() });
    },
  });

  const handleSubmit = () => {
    const payload = {
      name: form.name.trim(),
      role: form.role,
      contact: { phone: form.phone.trim(), address: form.address.trim() },
      wage: {
        type: form.wageType,
        amount: Number(form.wageAmount),
      },
      notes: form.notes.trim(),
      joiningDate: form.joiningDate,
    };
    mutate(payload);
  };

  const isValid = form.name.trim() && form.phone.trim().length === 10 && form.wageAmount;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="bg-background flex-1">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <Text className="text-foreground text-lg font-bold">New Employee</Text>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          {isError && (
            <View className="px-4 pt-4">
              <ErrorMessage error={error} />
            </View>
          )}

          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Name *</Text>
              <Input placeholder="e.g. Ramesh Kumar" value={form.name} onChangeText={v => set('name', v)} />
            </View>

            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Phone (10 digits) *</Text>
              <Input placeholder="9876543210" keyboardType="phone-pad" maxLength={10} value={form.phone} onChangeText={v => set('phone', v)} />
            </View>

            <View className="gap-y-1.5">
              <Text className="text-foreground text-sm font-medium">Role *</Text>
              <ThemedSelect items={ROLES} value={form.role} onValueChange={v => set('role', v)} placeholder="Select Role" />
            </View>

            <View className="gap-y-3 pt-2">
              <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Wage Configuration</Text>
              <View className="flex-row gap-x-3">
                <View className="flex-1 gap-y-1.5">
                  <Text className="text-foreground text-sm font-medium">Type *</Text>
                  <ThemedSelect items={WAGE_TYPES} value={form.wageType} onValueChange={v => set('wageType', v)} />
                </View>
                <View className="flex-1 gap-y-1.5">
                  <Text className="text-foreground text-sm font-medium">Amount (₹) *</Text>
                  <Input placeholder="e.g. 500" keyboardType="numeric" value={form.wageAmount} onChangeText={v => set('wageAmount', v)} />
                </View>
              </View>
            </View>

            <View className="gap-y-1.5 pt-2">
              <Text className="text-foreground text-sm font-medium">Address (Optional)</Text>
              <Input placeholder="Employee address" value={form.address} onChangeText={v => set('address', v)} />
            </View>

            <View className="gap-y-1.5 pt-2">
              <Text className="text-foreground text-sm font-medium">Joining Date</Text>
              <Button
                variant="outline"
                onPress={() => setShowDatePicker(true)}
                className="justify-start">
                <Text className="text-foreground">
                  {form.joiningDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </Button>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={form.joiningDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setForm((f) => ({ ...f, joiningDate: selectedDate }));
                }}
                maximumDate={new Date()}
              />
            )}

            <View className="gap-y-1.5 pt-2">
              <Text className="text-foreground text-sm font-medium">Notes (Optional)</Text>
              <Input placeholder="Employee notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />
            </View>
          </ScrollView>

          <View className="border-border border-t px-4 pt-3 pb-8">
            <Button onPress={handleSubmit} disabled={isPending || !isValid} className="w-full">
              <Text>{isPending ? 'Saving...' : 'Add Employee'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}
