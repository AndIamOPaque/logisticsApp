import React, { useState, useEffect } from 'react';
import { View, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ThemedSelect } from '@/components/ui/themed-select';
import { ErrorMessage } from '@/components/ui/errorMessage';
import { updateAttendanceRecord } from '@/api/attendance';
import { ModalToast } from '@/components/ui/modalToast';

const STATUS_OPTIONS = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Leave', value: 'leave' },
  { label: 'Half Day', value: 'half-day' },
];

export default function EditAttendanceModal({ visible, onClose, record }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    status: record?.status || 'present',
  });

  useEffect(() => {
    if (record) {
      setForm({ status: record.status || 'present' });
    }
  }, [record]);

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: (data) => updateAttendanceRecord(record._id, data),
    meta: { successMessage: 'Attendance updated successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employeeAttendance'] });
      qc.invalidateQueries({ queryKey: ['employee'] });
      qc.invalidateQueries({ queryKey: ['dailyAttendance'] });
      onClose();
    },
  });

  const handleSubmit = () => {
    mutate({ newStatus: form.status });
  };

  if (!record) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-black/50 px-4">
        <View className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-foreground text-xl font-bold">Edit Record</Text>
            <Button variant="ghost" size="icon" onPress={onClose} className="rounded-full bg-muted w-8 h-8">
              <Icon as={XIcon} className="text-muted-foreground size-4" />
            </Button>
          </View>

          <Text className="text-muted-foreground mb-4 text-sm">
            Date: {new Date(record.date).toLocaleDateString()}
          </Text>

          {isError && <ErrorMessage error={error} />}

          <View className="gap-y-1.5 mb-6">
            <Text className="text-foreground text-sm font-medium">New Status</Text>
            <ThemedSelect items={STATUS_OPTIONS} value={form.status} onValueChange={v => setForm({ ...form, status: v })} />
          </View>

          <Button onPress={handleSubmit} disabled={isPending} className="w-full">
            <Text>{isPending ? 'Saving...' : 'Update Record'}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
      <ModalToast />
    </Modal>
  );
}
