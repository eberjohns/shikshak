from pydantic import BaseModel
from typing import List, Optional, Dict

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    password: str
    is_teacher: bool = False

class UserLogin(BaseModel):
    name: str
    password: str

class User(UserBase):
    id: int
    is_teacher: bool

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    name: str

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    teacher_id: int

    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    title: str
    course_id: int

class ExamCreate(ExamBase):
    pass

class Exam(ExamBase):
    id: int

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question_text: str
    question_type: str
    options: Optional[Dict[str, str]] = None
    correct_option: Optional[str] = None
    grading_rules: Optional[str] = None

class QuestionCreate(QuestionBase):
    exam_id: int
    topic_id: int

class Question(QuestionBase):
    id: int
    exam_id: int
    topic_id: int

    class Config:
        from_attributes = True

class AnswerBase(BaseModel):
    answer_text: str

class AnswerCreate(AnswerBase):
    question_id: int
    student_id: int

class Answer(AnswerBase):
    id: int
    question_id: int
    student_id: int
    score: float
    is_correct: str
    ai_feedback: Optional[str] = None
    ai_error_analysis: Optional[str] = None
    final_feedback: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None