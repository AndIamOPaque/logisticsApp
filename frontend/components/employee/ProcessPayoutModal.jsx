import React, { useState } from 'react';
import { View, ScrollView, Modal, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { processPayout } from '@/api/employee';
import { ModalToast } from '@/components/ui/modalToast';

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank Transfer', value: 'BANK' },
  { label: 'UPI', value: 'UPI' },
];

export default function ProcessPayoutModal({ visible, onClose, employee }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    amount: employee?.balance > 0 ? employee.balance.toString() : '',
    paymentMethod: 'CASH',
    notes: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: (data) => processPayout(employee._id, data),
    meta: { successMessage: 'Payout processed successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee', employee._id] });
      onClose();
      setForm({ amount: '', paymentMethod: 'CASH', notes: '' });
    },
  });

  const handleSubmit = () => {
    mutate({
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      notes: form.notes,
    });
  };

  const isValid = Number(form.amount) > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl pt-6 px-6 pb-10 max-h-[80%] border-t border-border shadow-lg">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-foreground text-xl font-bold">Process Payout</Text>
            <Button variant="ghost" size="icon" onPress={onClose} className="rounded-full bg-muted">
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </Button>
          </View>

          {isError && <ErrorMessage error={error} />}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="bg-muted rounded-xl p-4 mb-6 flex-row justify-between items-center">
              <Text className="text-muted-foreground font-medium">Current Balance</Text>
              <Text className={`font-bold text-lg ${employee?.balance > 0 ? 'text-green-500' : employee?.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                ₹{employee?.balance || 0}
              </Text>
            </View>

            <View className="gap-y-4">
              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Amount to Pay (₹) *</Text>
                <Input placeholder="0.00" keyboardType="numeric" value={form.amount} onChangeText={v => set('amount', v)} />
              </View>

              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Payment Method *</Text>
                <ThemedSelect items={PAYMENT_METHODS} value={form.paymentMethod} onValueChange={v => set('paymentMethod', v)} />
              </View>

              <View className="gap-y-1.5">
                <Text className="text-foreground text-sm font-medium">Notes (Optional)</Text>
                <Input placeholder="e.g. Cleared pending dues" value={form.notes} onChangeText={v => set('notes', v)} />
              </View>
            </View>
          </ScrollView>

          <Button onPress={handleSubmit} disabled={isPending || !isValid} className="w-full mt-4">
            <Text>{isPending ? 'Processing...' : 'Confirm Payout'}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}
