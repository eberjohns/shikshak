import api from '@/lib/api';
import { Course } from '@/lib/types';

export const getCourses = async (teacherId: number): Promise<Course[]> => {
  const response = await api.get(`/courses?teacher_id=${teacherId}`);
  return response.data;
};

export const createCourse = async (courseName: string, teacherId: number): Promise<Course> => {
  const response = await api.post(`/courses?course_name=${courseName}&teacher_id=${teacherId}`);
  return response.data;
};