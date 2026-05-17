import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BanknoteIcon, Settings2Icon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedSelect } from '@/components/ui/themed-select';
import { updateWage } from '@/api/employee';

const WAGE_TYPES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Per Trip', value: 'per_trip' },
];

export default function OverviewTab({ employee, lifecycleStats, reportPending }) {
  const qc = useQueryClient();
  const [wageForm, setWageForm] = useState({
    type: employee?.wage?.type || '',
    amount: employee?.wage?.amount?.toString() || '',
  });
  const [isEditingWage, setIsEditingWage] = useState(false);

  React.useEffect(() => {
    if (employee && employee.wage) {
      setWageForm({ type: employee.wage.type, amount: employee.wage.amount.toString() });
    }
  }, [employee]);

  const updateWageMutation = useMutation({
    mutationFn: (data) => updateWage(employee._id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee', employee._id] });
      setIsEditingWage(false);
    },
  });
  console.log('reached overview tab', employee);

  return (
    <View className="gap-y-4">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{employee.name}</CardTitle>
          <CardDescription className="font-bold tracking-wider uppercase">
            {employee.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-y-3">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Phone</Text>
            <Text className="text-foreground font-medium">{employee.contact?.phone}</Text>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Status</Text>
            <Badge variant={employee.isActive ? 'default' : 'destructive'}>
              <Text>{employee.isActive ? 'Active' : 'Inactive'}</Text>
            </Badge>
          </View>
          <Separator />
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Balance</Text>
            <Text
              className={`font-bold ${employee.balance > 0 ? 'text-green-500' : employee.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              ₹{employee.balance}
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Wage Config Card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <View>
            <CardTitle>Wage Structure</CardTitle>
          </View>
          <Button size="sm" variant="ghost" onPress={() => setIsEditingWage(!isEditingWage)}>
            <Icon as={Settings2Icon} className="text-muted-foreground size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isEditingWage ? (
            <View className="gap-y-3">
              <View className="flex-row gap-x-2">
                <View className="flex-1">
                  <ThemedSelect
                    items={WAGE_TYPES}
                    value={wageForm.type}
                    onValueChange={(v) => setWageForm({ ...wageForm, type: v })}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={wageForm.amount}
                    onChangeText={(v) => setWageForm({ ...wageForm, amount: v })}
                  />
                </View>
              </View>
              <Button
                size="sm"
                disabled={updateWageMutation.isPending}
                onPress={() =>
                  updateWageMutation.mutate({
                    type: wageForm.type,
                    amount: Number(wageForm.amount),
                  })
                }>
                <Text>{updateWageMutation.isPending ? 'Saving...' : 'Save'}</Text>
              </Button>
            </View>
          ) : (
            <View className="flex-row items-center gap-x-2">
              <View className="bg-primary/10 rounded-lg p-2">
                <Icon as={BanknoteIcon} className="text-primary size-5" />
              </View>
              <View>
                <Text className="text-foreground font-bold">₹{employee.wage?.amount}</Text>
                <Text className="text-muted-foreground text-xs tracking-wider uppercase">
                  {employee.wage?.type}
                </Text>
              </View>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Lifecycle Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Lifecycle Stats</CardTitle>
          <CardDescription>All-time financial overview</CardDescription>
        </CardHeader>
        <CardContent>
          {reportPending ? (
            <ActivityIndicator size="small" />
          ) : (
            <View className="gap-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Total Value Earned</Text>
                <Text className="font-bold text-green-500">
                  ₹{lifecycleStats?.lifetimeEarnings || 0}
                </Text>
              </View>
              <Separator />
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Total Cash Paid</Text>
                <Text className="text-foreground font-bold">
                  ₹{lifecycleStats?.lifetimePaid || 0}
                </Text>
              </View>
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
}
