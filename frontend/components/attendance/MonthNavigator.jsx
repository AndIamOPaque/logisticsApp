import React, { useState } from 'react';
import { View } from 'react-native';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function MonthNavigator({ month, year, onChange }) {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const navigateMonth = (direction) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    // Don't go beyond current month
    if (
      newYear > now.getFullYear() ||
      (newYear === now.getFullYear() && newMonth > now.getMonth() + 1)
    )
      return;
    onChange(newMonth, newYear);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigateMonth(-1)}
          className="h-8 w-8 rounded-lg">
          <Icon as={ChevronLeftIcon} className="text-foreground size-4" />
        </Button>
        <View className="items-center">
          <CardTitle>
            {new Date(year, month - 1).toLocaleString('default', { month: 'long' })}
          </CardTitle>
          <CardDescription>{year}</CardDescription>
        </View>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigateMonth(1)}
          disabled={isCurrentMonth}
          className={`h-8 w-8 rounded-lg ${isCurrentMonth ? 'opacity-30' : ''}`}>
          <Icon as={ChevronRightIcon} className="text-foreground size-4" />
        </Button>
      </CardHeader>
    </Card>
  );
}
