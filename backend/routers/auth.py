from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import User

router = APIRouter()

@router.post("/login/teacher")
def login_teacher():
	db: Session = SessionLocal()
	teacher = db.query(User).filter(User.is_teacher == 1).first()
	if not teacher:
		teacher = User(name="Teacher", is_teacher=1)
		db.add(teacher)
		db.commit()
		db.refresh(teacher)
	return {"id": teacher.id, "name": teacher.name, "is_teacher": True}

@router.post("/students")
def create_student(name: str):
	db: Session = SessionLocal()
	if db.query(User).filter(User.name == name).first():
		raise HTTPException(status_code=400, detail="Student already exists")
	student = User(name=name, is_teacher=0)
	db.add(student)
	db.commit()
	db.refresh(student)
	return {"id": student.id, "name": student.name, "is_teacher": False}

@router.get("/students")
def list_students():
	db: Session = SessionLocal()
	students = db.query(User).filter(User.is_teacher == 0).all()
	return [{"id": s.id, "name": s.name} for s in students]

@router.post("/login/student")
def login_student(student_id: int):
	db: Session = SessionLocal()
	student = db.query(User).filter(User.id == student_id, User.is_teacher == 0).first()
	if not student:
		raise HTTPException(status_code=404, detail="Student not found")
	return {"id": student.id, "name": student.name, "is_teacher": False}
