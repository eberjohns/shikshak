from sqlalchemy.orm import Session, joinedload
from . import models, schemas
from .core.security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.name == name).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        hashed_password=hashed_password,
        is_teacher=int(user.is_teacher)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def create_course(db: Session, course: schemas.CourseCreate, teacher_id: int):
    db_course = models.Course(**course.dict(), teacher_id=teacher_id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_exams(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Exam).options(joinedload(models.Exam.questions)).offset(skip).limit(limit).all()

def get_exam(db: Session, exam_id: int):
    return db.query(models.Exam).filter(models.Exam.id == exam_id).first()

def get_exam_questions(db: Session, exam_id: int):
    return db.query(models.Question).filter(models.Question.exam_id == exam_id).all()

def get_student_submissions(db: Session, student_id: int):
    return db.query(models.Answer).filter(models.Answer.student_id == student_id).all()