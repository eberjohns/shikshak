from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.post("/register/student", response_model=schemas.User)
async def register_student(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_name(db, name=user.name)
    if db_user:
        raise HTTPException(status_code=400, detail="Name already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login/teacher", response_model=schemas.User)
async def login_teacher(db: Session = Depends(get_db)):
    teacher = db.query(crud.models.User).filter(crud.models.User.is_teacher == True).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.get("/students", response_model=List[schemas.User])
async def list_students(db: Session = Depends(get_db)):
    return crud.get_users(db=db)

@router.post("/login/student", response_model=schemas.User)
async def login_student(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_user(db, user_id=student_id)
    if not student or student.is_teacher:
        raise HTTPException(status_code=404, detail="Student not found")
    return student