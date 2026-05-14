import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PayrollTab({ employee, onPayNow }) {
  return (
    <View className="gap-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <View>
            <CardTitle>Balance</CardTitle>
            <Text
              className={`text-2xl font-bold ${employee.balance > 0 ? 'text-green-500' : employee.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              ₹{employee.balance}
            </Text>
          </View>
          <Button size="sm" onPress={onPayNow}>
            <Text>Pay Now</Text>
          </Button>
        </CardHeader>
      </Card>

      {/* History could be fetched from bill API, but leaving this block empty for now or displaying a message */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground text-sm italic">
            Refer to Ledger / Bills section for full payout history.
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
