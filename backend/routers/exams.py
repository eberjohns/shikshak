from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.get("/exams/available", response_model=List[schemas.Exam])
async def get_available_exams(student_id: int, db: Session = Depends(get_db)):
    all_exams = crud.get_exams(db)
    student_submissions = crud.get_student_submissions(db, student_id=student_id)
    submitted_exam_ids = {submission.question.exam_id for submission in student_submissions}
    
    available_exams = [exam for exam in all_exams if exam.id not in submitted_exam_ids]
    return available_exams

@router.get("/exams/{exam_id}", response_model=schemas.Exam)
async def get_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = crud.get_exam(db, exam_id=exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.get("/exams/{exam_id}/questions", response_model=List[schemas.Question])
async def get_exam_questions(exam_id: int, db: Session = Depends(get_db)):
    questions = crud.get_exam_questions(db, exam_id=exam_id)
    return questions