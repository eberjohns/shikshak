import api from '@/lib/api';
import { User } from '@/lib/types';

export const login = async (name: string, password: string): Promise<any> => {
  const response = await api.post(`/token`, { name, password });
  return response.data;
};

export const register = async (name: string, password: string, is_teacher: boolean): Promise<User> => {
  const response = await api.post('/register', { name, password, is_teacher });
  return response.data;
};

// This function is no longer used for login but can be kept if a list of all users is needed
export const getStudents = async (): Promise<User[]> => {
  const response = await api.get('/students');
  return response.data;
};