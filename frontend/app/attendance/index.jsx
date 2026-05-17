import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { CalendarIcon, MenuIcon, MoreVerticalIcon, PencilIcon, SendIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/dashboard/sidebar';
import { fetchDailyAttendance, markDailyAttendanceBatch, updateAttendanceRecord } from '@/api/attendance';
import { fetchEmployees } from '@/api/employee';
import ConfirmDialog from '@/components/ui/confirmDialog';
import DateTimePicker from '@react-native-community/datetimepicker';

const STATUS_COLORS = {
  present: { bg: 'bg-green-500', track: '#22c55e' },
  absent: { bg: 'bg-destructive', track: '#888' },
  'half-day': { bg: 'bg-amber-500', track: '#f59e0b' },
  leave: { bg: 'bg-purple-500', track: '#a855f7' },
  pending: { bg: 'bg-muted', track: '#888' },
};

export default function DailyAttendanceScreen() {
  const qc = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Local attendance state: { [employeeId]: status }
  const [localStatuses, setLocalStatuses] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Options menu state
  const [optionsFor, setOptionsFor] = useState(null); // employeeId or null

  // Past-date edit state
  const [editConfirmId, setEditConfirmId] = useState(null); // employeeId pending confirmation
  const [editableIds, setEditableIds] = useState(new Set()); // unlocked employee IDs for past-date editing

  const dateStr = currentDate.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);

  // --- Queries ---
  const { data: employeesData, isPending: empPending } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: () => fetchEmployees({ isActive: true }),
  });

  const { data: attendanceData, isPending: attPending } = useQuery({
    queryKey: ['dailyAttendance', dateStr],
    queryFn: () => fetchDailyAttendance(dateStr),
  });

  const employees = employeesData?.data || [];
  const attendanceRecords = attendanceData || [];

  // --- Pre-populate local state from fetched records ---
  useEffect(() => {
    const statusMap = {};
    for (const emp of employees) {
      const record = attendanceRecords.find(
        a => (a.employee?._id || a.employee) === emp._id
      );
      statusMap[emp._id] = record ? record.status : 'absent';
    }
    setLocalStatuses(statusMap);
    setHasChanges(false);
    setEditableIds(new Set());
  }, [employees, attendanceRecords, dateStr]);

  // --- Mutations ---
  const batchMutation = useMutation({
    mutationFn: ({ date, entries }) => markDailyAttendanceBatch(date, entries),
    meta: { successMessage: 'Attendance submitted successfully' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dailyAttendance', dateStr] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      setHasChanges(false);
    }
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }) => updateAttendanceRecord(id, data),
    meta: { successMessage: 'Record updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dailyAttendance', dateStr] });
      qc.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  // --- Handlers ---
  const handleStatusChange = (employeeId, newStatus) => {
    setLocalStatuses(prev => ({ ...prev, [employeeId]: newStatus }));
    setHasChanges(true);
    setOptionsFor(null);
  };

  const handleToggle = (employeeId, currentStatus) => {
    if (isPast && !editableIds.has(employeeId)) return;
    const newStatus = (currentStatus === 'present' || currentStatus === 'half-day')
      ? 'absent'
      : 'present';
    handleStatusChange(employeeId, newStatus);
  };

  const handleSubmit = () => {
    const entries = Object.entries(localStatuses)
      .filter(([_, status]) => status !== 'pending')
      .map(([employeeId, status]) => ({ employeeId, status }));

    if (entries.length === 0) return;
    batchMutation.mutate({ date: dateStr, entries });
  };

  const handleEditConfirm = () => {
    if (editConfirmId) {
      setEditableIds(prev => new Set(prev).add(editConfirmId));
      setEditConfirmId(null);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setCurrentDate(selectedDate);
  };

  // --- Summary counts ---
  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, 'half-day': 0, leave: 0 };
    Object.values(localStatuses).forEach(s => {
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [localStatuses]);

  const isPending = empPending || attPending;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
      {/* Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-x-3">
          <Button variant="ghost" size="icon" onPress={() => setSidebarOpen(true)} className="rounded-lg h-8 w-8">
            <View className="gap-y-1">
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
              <View className="bg-foreground h-0.5 w-4 rounded-full" />
              <View className="bg-foreground h-0.5 w-5 rounded-full" />
            </View>
          </Button>
          <View className="flex-row items-center gap-x-2">
            <Icon as={CalendarIcon} className="text-foreground size-5" />
            <Text className="text-foreground text-lg font-bold">Attendance</Text>
          </View>
        </View>
        <Button variant="outline" size="sm" onPress={() => setShowDatePicker(true)} className="flex-row gap-x-2">
          <Text className="text-foreground text-xs font-medium">
            {currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </Button>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {/* Summary Bar */}
      {!isPending && (
        <View className="bg-card border-b border-border flex-row px-4 py-2.5 gap-x-3">
          {[
            { key: 'present', label: 'P', color: 'text-green-500 bg-green-500/10' },
            { key: 'absent', label: 'A', color: 'text-destructive bg-destructive/10' },
            { key: 'half-day', label: 'HD', color: 'text-amber-500 bg-amber-500/10' },
            { key: 'leave', label: 'L', color: 'text-purple-500 bg-purple-500/10' },
          ].map(item => (
            <View key={item.key} className={`flex-row items-center gap-x-1.5 px-2.5 py-1 rounded-lg ${item.color.split(' ')[1]}`}>
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${item.color.split(' ')[0]}`}>
                {item.label}
              </Text>
              <Text className={`text-sm font-bold ${item.color.split(' ')[0]}`}>{summary[item.key]}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Employee List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 55 }}
      >
        {isPending ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" />
          </View>
        ) : (
          employees.map(emp => {
            const status = localStatuses[emp._id] || 'pending';
            const isOn = status === 'present' || status === 'half-day';
            const isLocked = isPast && !editableIds.has(emp._id);
            const record = attendanceRecords.find(
              a => (a.employee?._id || a.employee) === emp._id
            );
            const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;

            return (
              <View key={emp._id} className="bg-card border-b border-border py-4 px-4">
                <View className="flex-row items-center justify-between">
                  {/* Left: Name + Role + Status badge */}
                  <View className="flex-1 mr-3">
                    <Text className="text-foreground font-semibold">{emp.name}</Text>
                    <View className="flex-row items-center gap-x-2 mt-1">
                      <Text className="text-muted-foreground text-xs">{emp.role}</Text>
                      {status !== 'pending' && (
                        <View className={`px-1.5 py-0.5 rounded ${statusColor.bg}/15`}>
                          <Text className={`text-[9px] font-bold uppercase tracking-wider ${statusColor.bg.replace('bg-', 'text-')}`}>
                            {status === 'half-day' ? 'H.Day' : status}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Right: Controls */}
                  <View className="flex-row items-center gap-x-2">
                    {/* Past-date lock: show edit button */}
                    {isLocked && (
                      <TouchableOpacity
                        onPress={() => setEditConfirmId(emp._id)}
                        className="bg-muted rounded-lg p-2"
                      >
                        <Icon as={PencilIcon} className="text-muted-foreground size-3.5" />
                      </TouchableOpacity>
                    )}

                    {/* Toggle */}
                    <Switch
                      value={isOn}
                      onValueChange={() => handleToggle(emp._id, status)}
                      disabled={isLocked || batchMutation.isPending}
                      trackColor={{ false: '#333', true: statusColor.track }}
                      thumbColor="#fff"
                    />

                    {/* Three-dot menu */}
                    {!isLocked && (
                      <TouchableOpacity
                        onPress={() => setOptionsFor(optionsFor === emp._id ? null : emp._id)}
                        className="p-1"
                      >
                        <Icon as={MoreVerticalIcon} className="text-muted-foreground size-4" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Options dropdown */}
                {optionsFor === emp._id && (
                  <View className="flex-row gap-x-2 mt-3 pl-1">
                    {['half-day', 'leave'].map(opt => {
                      const isActive = status === opt;
                      const optColor = STATUS_COLORS[opt];
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => handleStatusChange(emp._id, opt)}
                          className={`px-4 py-2 rounded-lg border ${isActive ? `${optColor.bg}/15 border-${optColor.bg.replace('bg-', '')}` : 'bg-muted border-transparent'}`}
                        >
                          <Text className={`text-xs font-bold uppercase tracking-wider ${isActive ? optColor.bg.replace('bg-', 'text-') : 'text-muted-foreground'}`}>
                            {opt === 'half-day' ? 'Half Day' : 'Leave'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Submit FAB */}
      {hasChanges && (
        <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: tabBarHeight + 12 }}>
          <Button
            onPress={handleSubmit}
            disabled={batchMutation.isPending}
            className="w-full flex-row items-center justify-center gap-x-2 rounded-xl shadow-lg"
            style={{ height: 50 }}
          >
            <Icon as={SendIcon} className="text-primary-foreground size-4" />
            <Text className="text-primary-foreground font-bold">
              {batchMutation.isPending ? 'Submitting...' : 'Submit Attendance'}
            </Text>
          </Button>
        </View>
      )}

      {/* Past-date edit confirmation dialog */}
      <ConfirmDialog
        visible={!!editConfirmId}
        title="Edit Past Attendance"
        message="Editing past attendance may affect payroll calculations. Continue?"
        confirmText="Continue"
        variant="default"
        onConfirm={handleEditConfirm}
        onCancel={() => setEditConfirmId(null)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
