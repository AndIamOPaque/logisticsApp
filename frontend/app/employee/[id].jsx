import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon, AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fetchEmployeeById, fetchEmployeeReport } from '@/api/employee';
import ProcessPayoutModal from '@/components/employee/ProcessPayoutModal';
import OverviewTab from '@/components/employee/OverviewTab';
import AttendanceTab from '@/components/employee/AttendanceTab';
import PayrollTab from '@/components/employee/PayrollTab';

export default function EmployeeDetail() {
  const { id } = useLocalSearchParams();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState('overview');
  const [payoutVisible, setPayoutVisible] = useState(false);

  const {
    data: employee,
    isPending,
    error,
  } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployeeById(id),
  });

  const { data: lifecycleStats, isPending: reportPending } = useQuery({
    queryKey: ['employeeReport', id],
    queryFn: () => fetchEmployeeReport(id),
    enabled: activeTab === 'overview',
  });

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !employee) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-y-4 p-6">
        <Icon as={AlertTriangle} className="text-destructive size-12" />
        <Text className="text-foreground text-xl font-bold">Employee Not Found</Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
        {/* Header */}
        <View className="flex-row items-center gap-x-2 px-4 pt-4 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="h-8 w-8 rounded-xl">
            <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
          </Button>
          <Text className="text-foreground text-lg font-bold">Employee Info</Text>
        </View>

        {/* Tab Pills */}
        <View className="px-4 pb-4">
          <View className="bg-muted flex-row gap-x-1 rounded-xl p-1">
            {['overview', 'attendance', 'payroll'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-lg py-2 ${activeTab === tab ? 'bg-card shadow-sm' : ''}`}>
                <Text
                  className={`text-xs font-semibold capitalize ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-4">
          {activeTab === 'overview' && (
            <OverviewTab
              employee={employee.data}
              lifecycleStats={lifecycleStats}
              reportPending={reportPending}
            />
          )}

          {activeTab === 'attendance' && <AttendanceTab employeeId={id} />}

          {activeTab === 'payroll' && (
            <PayrollTab employee={employee} onPayNow={() => setPayoutVisible(true)} />
          )}
        </View>
      </ScrollView>

      {payoutVisible && (
        <ProcessPayoutModal
          visible={payoutVisible}
          onClose={() => setPayoutVisible(false)}
          employee={employee}
        />
      )}
    </SafeAreaView>
  );
}
