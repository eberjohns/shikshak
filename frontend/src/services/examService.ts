import api from '@/lib/api';
import { Exam, Question } from '@/lib/types';

export const getAvailableExams = async (studentId: number): Promise<Exam[]> => {
  const response = await api.get(`/exams/available?student_id=${studentId}`);
  return response.data;
};

export const getExam = async (examId: string): Promise<Exam> => {
  const response = await api.get(`/exams/${examId}`);
  return response.data;
};

export const getExamQuestions = async (examId: string): Promise<Question[]> => {
  const response = await api.get(`/exams/${examId}/questions`);
  return response.data;
};

export const submitExam = async (examId: string, studentId: number, answers: { question_id: number; answer_text: string }[]) => {
  const response = await api.post(`/exams/${examId}/submit`, {
    student_id: studentId,
    answers: answers,
  });
  return response.data;
};

// New function to get exam history
export const getExamHistory = async (studentId: number): Promise<Exam[]> => {
    // Note: This endpoint `/exams/history/${studentId}` needs to be created in your backend.
    // It should return a list of exams the student has taken, including their status and score.
    const response = await api.get(`/exams/history/${studentId}`);
    return response.data;
}