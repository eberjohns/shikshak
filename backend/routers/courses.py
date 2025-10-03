from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db, SessionLocal
from ..models import Course, User
from typing import List
from ..schemas import Course as CourseSchema

router = APIRouter()

# Teacher creates a new course
@router.post("/courses", response_model=CourseSchema)
def create_course(course_name: str, teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.is_teacher == 1).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    new_course = Course(name=course_name, teacher_id=teacher_id)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

# Teacher gets a list of their courses
@router.get("/courses", response_model=List[CourseSchema])
def list_courses(teacher_id: int, db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.teacher_id == teacher_id).all()
    return courses