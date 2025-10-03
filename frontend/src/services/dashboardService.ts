import api from '@/lib/api';

export const getStudentDashboard = async (studentId: number) => {
  const response = await api.get(`/dashboard/student?student_id=${studentId}`);
  return response.data;
};

export const getTeacherDashboard = async (courseId: string) => {
  const response = await api.get(`/dashboard/teacher/${courseId}`);
  return response.data;
};