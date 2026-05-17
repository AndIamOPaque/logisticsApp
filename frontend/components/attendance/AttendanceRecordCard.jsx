import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ClockIcon, PencilIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const STATUS_COLOR_MAP = {
  present: 'text-green-500',
  absent: 'text-destructive',
  'half-day': 'text-amber-500',
  leave: 'text-purple-500',
};

export default function AttendanceRecordCard({ record, onEditPress }) {
  const statusColor = STATUS_COLOR_MAP[record.status] || 'text-muted-foreground';

  return (
    <View className="border-border border-b py-3 last:border-0">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-foreground text-[10px] font-semibold tracking-widest uppercase">
          {new Date(record.date).toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        <View className="flex-row items-center gap-x-2">
          <Text className={`text-xs font-bold uppercase ${statusColor}`}>
            {record.status}
          </Text>
          {onEditPress && (
            <TouchableOpacity
              onPress={() => onEditPress(record)}
              className="bg-muted rounded-lg p-1.5">
              <Icon as={PencilIcon} className="text-muted-foreground size-3" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-2">
          <Icon as={ClockIcon} className="text-muted-foreground size-3" />
          <Text className="text-muted-foreground text-xs">
            {record.inTime
              ? new Date(record.inTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--'}{' '}
            to{' '}
            {record.outTime
              ? new Date(record.outTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--'}
          </Text>
        </View>
        <Text className="text-foreground text-xs font-medium">
          ₹{record.payableAmount}
        </Text>
      </View>
    </View>
  );
}
