import api from '@/lib/api';
import { Submission, User } from '@/lib/types';

export const getSubmissions = async (examId: string): Promise<Submission[]> => {
  const response = await api.get(`/exams/${examId}/submissions`);
  return response.data;
};

export const getStudent = async (studentId: number): Promise<User> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
};

export const reviewGrading = async (answerId: number, score: number, finalFeedback: string, isCorrect: string) => {
    const response = await api.post('/teacher/grade/review', {
        answer_id: answerId,
        score,
        final_feedback: finalFeedback,
        is_correct: isCorrect,
    });
    return response.data;
};