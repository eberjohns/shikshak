import api from '@/lib/api';
import { Course } from '@/lib/types';

export const getCourses = async (teacherId: number): Promise<Course[]> => {
  const response = await api.get(`/courses?teacher_id=${teacherId}`);
  return response.data;
};

export const getCourse = async (courseId: string): Promise<Course> => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const createCourse = async (courseName: string, teacherId: number): Promise<Course> => {
  // Pass teacherId as a query param and courseName in the request body
  const response = await api.post(`/courses?teacher_id=${teacherId}`, { name: courseName });
  return response.data;
};

export const deleteCourse = async (courseId: number, teacherId: number): Promise<void> => {
  await api.delete(`/courses/${courseId}?teacher_id=${teacherId}`);
};