import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchEmployeeAttendance } from '@/api/attendance';
import MonthNavigator from '@/components/attendance/MonthNavigator';
import AttendanceMetricsPills from '@/components/attendance/AttendanceMetricsPills';
import AttendanceRecordCard from '@/components/attendance/AttendanceRecordCard';
import ConfirmDialog from '@/components/ui/confirmDialog';
import EditAttendanceModal from '@/components/attendance/EditAttendanceModal';

export default function AttendanceTab({ employeeId }) {
  const now = new Date();
  const [attMonth, setAttMonth] = useState(now.getMonth() + 1);
  const [attYear, setAttYear] = useState(now.getFullYear());

  const [editConfirmRecord, setEditConfirmRecord] = useState(null);
  const [editAttRecord, setEditAttRecord] = useState(null);

  // Attendance query returns { records, metrics }
  const { data: attendanceData, isPending: attPending } = useQuery({
    queryKey: ['employeeAttendance', employeeId, attMonth, attYear],
    queryFn: () => fetchEmployeeAttendance(employeeId, attMonth, attYear),
  });

  const attendanceLogs = attendanceData?.records || attendanceData || [];
  const attMetrics = attendanceData?.metrics || null;

  const handleMonthChange = (newMonth, newYear) => {
    setAttMonth(newMonth);
    setAttYear(newYear);
  };

  const calculatedMetrics = React.useMemo(() => {
    if (!attendanceLogs || attendanceLogs.length === 0) return attMetrics;
    const stats = { daysPresent: 0, daysAbsent: 0, halfDays: 0, leaves: 0, totalMarked: attendanceLogs.length };
    attendanceLogs.forEach(log => {
      if (log.status === 'present') stats.daysPresent++;
      else if (log.status === 'absent') stats.daysAbsent++;
      else if (log.status === 'half-day') stats.halfDays++;
      else if (log.status === 'leave') stats.leaves++;
    });
    stats.attendancePercentage = stats.totalMarked > 0 ? Math.round(((stats.daysPresent + stats.halfDays * 0.5) / stats.totalMarked) * 100) : 0;
    return { ...attMetrics, ...stats };
  }, [attendanceLogs, attMetrics]);

  return (
    <View className="gap-y-4">
      {/* Month Navigator */}
      <MonthNavigator month={attMonth} year={attYear} onChange={handleMonthChange} />

      {/* Metrics */}
      <AttendanceMetricsPills metrics={calculatedMetrics} />

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attPending ? (
            <ActivityIndicator size="small" />
          ) : attendanceLogs?.length > 0 ? (
            attendanceLogs.map((log) => (
              <AttendanceRecordCard
                key={log._id}
                record={log}
                onEditPress={(record) => setEditConfirmRecord(record)}
              />
            ))
          ) : (
            <Text className="text-muted-foreground text-sm">
              No attendance records this month.
            </Text>
          )}
        </CardContent>
      </Card>

      {/* Edit confirmation → opens modal */}
      <ConfirmDialog
        visible={!!editConfirmRecord}
        title="Edit Attendance Record"
        message={`Edit attendance for ${editConfirmRecord ? new Date(editConfirmRecord.date).toLocaleDateString() : ''}? This may trigger wage recalculation.`}
        confirmText="Edit"
        variant="default"
        onConfirm={() => {
          setEditAttRecord(editConfirmRecord);
          setEditConfirmRecord(null);
        }}
        onCancel={() => setEditConfirmRecord(null)}
      />

      {editAttRecord && (
        <EditAttendanceModal
          visible={!!editAttRecord}
          onClose={() => setEditAttRecord(null)}
          record={editAttRecord}
        />
      )}
    </View>
  );
}
