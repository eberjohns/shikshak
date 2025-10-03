from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Course, User

router = APIRouter()

# Teacher creates a new course
@router.post("/courses")
def create_course(teacher_id: int, name: str):
	db: Session = SessionLocal()
	teacher = db.query(User).filter(User.id == teacher_id, User.is_teacher == 1).first()
	if not teacher:
		raise HTTPException(status_code=404, detail="Teacher not found")
	course = Course(name=name, teacher_id=teacher_id)
	db.add(course)
	db.commit()
	db.refresh(course)
	return {"id": course.id, "name": course.name}

# Teacher gets a list of their courses
@router.get("/courses")
def list_courses(teacher_id: int):
	db: Session = SessionLocal()
	courses = db.query(Course).filter(Course.teacher_id == teacher_id).all()
	return [{"id": c.id, "name": c.name} for c in courses]
