export type UserRole = "teacher" | "student";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
};

export type Course = {
  id: number;
  name: string;
  teacher_id: number;
};

export type Topic = {
  id: number;
  name: string;
  course_id: number;
};

export type Exam = {
  id: number;
  title: string;
  course_id: number;
};

export type QuestionType = "objective" | "subjective";

export type ErrorType = "conceptual" | "interpretational" | "procedural" | "none";

export type Question = {
  id: number;
  exam_id: number;
  topic_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: { [key: string]: string }; // For objective questions
  correct_option?: string; // "A"
  grading_rules?: string; // For subjective questions
};

export type Answer = {
  id: number;
  question_id: number;
  student_id: number;
  answer_text: string;
  score: number;
  is_correct: "true" | "false" | "pending_review";
  ai_feedback?: string;
  ai_error_analysis?: ErrorType;
  final_feedback?: string;
};

export type Submission = {
    studentId: number;
    studentName: string;
    answers: Answer[];
    status: 'pending_review' | 'graded';
};
