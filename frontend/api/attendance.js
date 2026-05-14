import api from './client';

export const clockIn = async (data) => {
  const response = await api.post('/attendance/clock-in', data);
  return response.data;
};

export const clockOut = async (data) => {
  const response = await api.post('/attendance/clock-out', data);
  return response.data;
};

export const markAttendanceStatus = async (data) => {
  const response = await api.post('/attendance/status', data);
  return response.data;
};

export const updateAttendanceRecord = async (id, data) => {
  const response = await api.patch(`/attendance/${id}`, data);
  return response.data;
};

export const fetchDailyAttendance = async (date) => {
  const response = await api.get('/attendance/daily', { params: { date } });
  return response.data.data;
};

export const markDailyAttendanceBatch = async (date, entries) => {
  const response = await api.post('/attendance/daily', { date, entries });
  return response.data;
};


export const fetchEmployeeAttendance = async (employeeId, month, year) => {
  const response = await api.get('/attendance/employee', { params: { employeeId, month, year } });
  return response.data.data;
};

export const fetchSingleAttendanceRecord = async (employeeId, date) => {
  const response = await api.get('/attendance/single', { params: { employeeId, date } });
  return response.data.data;
};
