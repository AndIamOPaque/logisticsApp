import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';

const METRIC_ITEMS = [
  { key: 'daysPresent', label: 'Present', color: 'text-green-500 bg-green-500/10' },
  { key: 'daysAbsent', label: 'Absent', color: 'text-destructive bg-destructive/10' },
  { key: 'halfDays', label: 'H.Day', color: 'text-amber-500 bg-amber-500/10' },
  { key: 'leaves', label: 'Leave', color: 'text-purple-500 bg-purple-500/10' },
];

export default function AttendanceMetricsPills({ metrics }) {
  if (!metrics) return null;

  return (
    <View className="gap-y-3">
      {/* Stat Pills */}
      <View className="flex-row gap-x-2">
        {METRIC_ITEMS.map((item) => (
          <View
            key={item.key}
            className={`flex-1 items-center rounded-xl py-2.5 ${item.color.split(' ')[1]}`}>
            <Text className={`text-lg font-bold ${item.color.split(' ')[0]}`}>
              {metrics[item.key] || 0}
            </Text>
            <Text
              className={`text-[9px] font-bold tracking-wider uppercase ${item.color.split(' ')[0]}`}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Attendance Percentage */}
      {metrics.totalMarked > 0 && (
        <Card>
          <CardContent className="flex-row items-center justify-between py-3">
            <Text className="text-muted-foreground text-sm">Attendance Rate</Text>
            <Text
              className={`text-xl font-bold ${metrics.attendancePercentage >= 75 ? 'text-green-500' : metrics.attendancePercentage >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
              {metrics.attendancePercentage}%
            </Text>
          </CardContent>
        </Card>
      )}
    </View>
  );
}
