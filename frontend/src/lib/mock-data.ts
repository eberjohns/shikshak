import type { User, Course, Exam, Question, Topic, Submission, Answer } from './types';

export const mockUsers: User[] = [
  { id: 1, email: 'teacher@shikshak.ai', full_name: 'Dr. Evelyn Reed', role: 'teacher' },
  { id: 2, email: 'student@shikshak.ai', full_name: 'Alex Johnson', role: 'student' },
  { id: 3, email: 'another.student@shikshak.ai', full_name: 'Ben Carter', role: 'student' },
];

export const mockCourses: Course[] = [
  { id: 1, name: 'Advanced Biology', teacher_id: 1 },
  { id: 2, name: 'Introduction to Physics', teacher_id: 1 },
];

export const mockTopics: Topic[] = [
    { id: 1, course_id: 1, name: 'Cellular Respiration' },
    { id: 2, course_id: 1, name: 'Photosynthesis' },
    { id: 3, course_id: 1, name: 'Genetics' },
    { id: 4, course_id: 2, name: 'Newtonian Mechanics' },
    { id: 5, course_id: 2, name: 'Thermodynamics' },
];

export const mockExams: Exam[] = [
  { id: 1, course_id: 1, title: 'Midterm Exam' },
  { id: 2, course_id: 1, title: 'Final Exam' },
];

export const mockQuestions: Question[] = [
    {
        id: 1,
        exam_id: 1,
        topic_id: 1,
        question_text: 'What is the primary function of mitochondria?',
        question_type: 'subjective',
        grading_rules: 'Key points to mention: ATP production, powerhouse of the cell. Classify as \'procedural\' if steps are out of order.'
    },
    {
        id: 2,
        exam_id: 1,
        topic_id: 2,
        question_text: 'Which of the following is a product of photosynthesis?',
        question_type: 'objective',
        options: { 'A': 'Carbon Dioxide', 'B': 'Water', 'C': 'Oxygen', 'D': 'Nitrogen' },
        correct_option: 'C'
    },
    {
        id: 3,
        exam_id: 1,
        topic_id: 1,
        question_text: 'Describe the process of glycolysis.',
        question_type: 'subjective',
        grading_rules: 'Must mention breakdown of glucose into pyruvate. Mention net gain of 2 ATP. Marks deducted for incorrect sequence of events.'
    }
];

export const mockStudentAnswersForExam1: Answer[] = [
    { id: 1, question_id: 1, student_id: 2, answer_text: 'Mitochondria make energy for the cell. Its where the cell breathes.', score: 0, is_correct: 'pending_review' },
    { id: 2, question_id: 2, student_id: 2, answer_text: 'C', score: 1, is_correct: 'true' },
    { id: 3, question_id: 3, student_id: 2, answer_text: 'Glycolysis is when glucose is turned into energy. It happens in the mitochondria.', score: 0, is_correct: 'pending_review' },
    { id: 4, question_id: 1, student_id: 3, answer_text: 'The mitochondria is the powerhouse of the cell. It creates ATP through cellular respiration.', score: 0, is_correct: 'pending_review' },
    { id: 5, question_id: 2, student_id: 3, answer_text: 'A', score: 0, is_correct: 'false' },
    { id: 6, question_id: 3, student_id: 3, answer_text: 'It is the first step of respiration. Glucose is broken down. It makes some ATP.', score: 0, is_correct: 'pending_review' },
];


export const mockSubmissions: Submission[] = [
    {
        studentId: 2,
        studentName: 'Alex Johnson',
        answers: mockStudentAnswersForExam1.filter(a => a.student_id === 2),
        status: 'pending_review'
    },
    {
        studentId: 3,
        studentName: 'Ben Carter',
        answers: mockStudentAnswersForExam1.filter(a => a.student_id === 3),
        status: 'pending_review'
    }
]
