from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, models, schemas
from typing import List

router = APIRouter()

@router.post("/courses", response_model=schemas.Course)
def create_course(course: schemas.CourseCreate, teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.User).filter(models.User.id == teacher_id, models.User.is_teacher == 1).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    db_course = models.Course(name=course.name, teacher_id=teacher_id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/courses", response_model=List[schemas.Course])
def list_courses(teacher_id: int, db: Session = Depends(get_db)):
    courses = db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()
    return courses

@router.get("/courses/{course_id}", response_model=schemas.Course)
def read_course(course_id: int, db: Session = Depends(get_db)):
    db_course = crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, teacher_id: int, db: Session = Depends(get_db)):
    db_course = crud.get_course(db, course_id=course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    if db_course.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    
    crud.delete_course(db, course_id=course_id)
    return {"ok": True}