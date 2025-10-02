import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class UserRole(enum.Enum):
    teacher = "teacher"
    student = "student"

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True, nullable=False)
    is_teacher = Column(Integer, default=0)  # 1 for teacher, 0 for student
    courses = relationship("Course", back_populates="teacher")
    answers = relationship("Answer", back_populates="student")

class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey('users.id'))
    teacher = relationship("User", back_populates="courses")
    exams = relationship("Exam", back_populates="course")
    topics = relationship("Topic", back_populates="course")

class Topic(Base):
    __tablename__ = 'topics'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    course = relationship("Course", back_populates="topics")

class Exam(Base):
    __tablename__ = 'exams'
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    course = relationship("Course", back_populates="exams")
    questions = relationship("Question", back_populates="exam")

class QuestionType(enum.Enum):
    objective = "objective"
    subjective = "subjective"

class ErrorType(enum.Enum):
    conceptual = "conceptual"
    interpretational = "interpretational"
    procedural = "procedural"
    none = "none"

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey('exams.id'))
    topic_id = Column(Integer, ForeignKey('topics.id'))
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType))
    options = Column(Text) # JSON string
    correct_option = Column(String)
    grading_rules = Column(Text, nullable=True)
    exam = relationship("Exam", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = 'answers'
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'))
    student_id = Column(Integer, ForeignKey('users.id'))
    answer_text = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    is_correct = Column(String, default="pending")
    ai_feedback = Column(Text)
    ai_error_analysis = Column(Enum(ErrorType))
    final_feedback = Column(Text)
    question = relationship("Question", back_populates="answers")
    student = relationship("User", back_populates="answers")
