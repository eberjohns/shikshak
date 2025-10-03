import api from '@/lib/api';
import { User } from '@/lib/types';

export const loginStudent = async (studentId: number): Promise<User> => {
  const response = await api.post(`/login/student?student_id=${studentId}`);
  return response.data;
};

export const registerStudent = async (name: string): Promise<User> => {
  const response = await api.post('/register/student', { name });
  return response.data;
};

export const loginTeacher = async (): Promise<User> => {
  const response = await api.post('/login/teacher');
  return response.data;
};

export const getStudents = async (): Promise<User[]> => {
  const response = await api.get('/students');
  return response.data;
};