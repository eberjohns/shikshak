from fastapi import Query,APIRouter

router = APIRouter()

# List available exams for a student (not yet taken)
@router.get("/exams/available")
def get_available_exams(student_id: int = Query(...)):
	db: Session = SessionLocal()
	# Find all courses the student is enrolled in (for now, assume all students can see all exams)
	exams = db.query(Exam).all()
	# Find all answers by this student
	answers = db.query(Answer).filter(Answer.student_id == student_id).all()
	answered_exam_ids = set()
	for ans in answers:
		q = db.query(Question).filter(Question.id == ans.question_id).first()
		if q:
			answered_exam_ids.add(q.exam_id)
	available = []
	for exam in exams:
		status = "completed" if exam.id in answered_exam_ids else "not_taken"
		available.append({
			"id": exam.id,
			"title": exam.title,
			"course": db.query(Course).filter(Course.id == exam.course_id).first().name if exam.course_id else None,
			"questions": len(exam.questions),
			"status": status
		})
	return {"exams": available}



from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Exam, Course, Question, QuestionType, Answer, ErrorType
from ..services.ai_grader import analyze_subjective_answer
from ..services.ocr import extract_text_from_image

router = APIRouter()

class AnswerSubmission(BaseModel):
	question_id: int
	answer_text: str

class ExamSubmitRequest(BaseModel):
	student_id: int
	answers: List[AnswerSubmission]


# Upload answer sheet image, extract text, and submit as answer
@router.post("/exams/{exam_id}/upload_answer")
async def upload_answer_image(exam_id: int, student_id: int = Form(...), question_id: int = Form(...), file: UploadFile = File(...)):
	db: Session = SessionLocal()
	exam = db.query(Exam).filter(Exam.id == exam_id).first()
	if not exam:
		raise HTTPException(status_code=404, detail="Exam not found")
	question = db.query(Question).filter(Question.id == question_id).first()
	if not question:
		raise HTTPException(status_code=404, detail="Question not found")
	image_bytes = await file.read()
	extracted_text = extract_text_from_image(image_bytes)
	if extracted_text is None:
		raise HTTPException(status_code=502, detail="Failed to extract text from image. OCR service unavailable or network error.")
	# Use extracted text as answer
	answer_obj = Answer(
		question_id=question.id,
		student_id=student_id,
		answer_text=extracted_text
	)
	if question.question_type.value == "objective":
		answer_obj.is_correct = "true" if extracted_text == question.correct_option else "false"
		answer_obj.score = 1.0 if answer_obj.is_correct == "true" else 0.0
	else:
		ai_result = analyze_subjective_answer(extracted_text, question.grading_rules or "")
		answer_obj.ai_feedback = ai_result["feedback"]
		error_type_str = ai_result["error_analysis"]
		try:
			answer_obj.ai_error_analysis = ErrorType(error_type_str)
		except Exception:
			answer_obj.ai_error_analysis = ErrorType.none
		answer_obj.is_correct = "pending_review"
	db.add(answer_obj)
	db.commit()
	db.refresh(answer_obj)
	return {
		"question_id": question.id,
		"answer_id": answer_obj.id,
		"extracted_text": extracted_text,
		"ai_feedback": getattr(answer_obj, "ai_feedback", None),
		"ai_error_analysis": getattr(answer_obj, "ai_error_analysis", None)
	}

# Student submits answers for an exam
@router.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: int, req: ExamSubmitRequest):
	db: Session = SessionLocal()
	exam = db.query(Exam).filter(Exam.id == exam_id).first()
	if not exam:
		raise HTTPException(status_code=404, detail="Exam not found")
	results = []
	for ans in req.answers:
		question = db.query(Question).filter(Question.id == ans.question_id).first()
		if not question:
			continue
		answer_obj = Answer(
			question_id=question.id,
			student_id=req.student_id,
			answer_text=ans.answer_text
		)
		if question.question_type.value == "objective":
			answer_obj.is_correct = "true" if ans.answer_text == question.correct_option else "false"
			answer_obj.score = 1.0 if answer_obj.is_correct == "true" else 0.0
		else:
			# Subjective: call AI grading
			# Rules are set by the teacher and passed to the AI for analysis only
			ai_result = analyze_subjective_answer(ans.answer_text, question.grading_rules or "")
			answer_obj.ai_feedback = ai_result["feedback"]
			from ..models import ErrorType
			error_type_str = ai_result["error_analysis"]
			try:
				answer_obj.ai_error_analysis = ErrorType(error_type_str)
			except Exception:
				answer_obj.ai_error_analysis = ErrorType.none
			answer_obj.is_correct = "pending_review"
		db.add(answer_obj)
		db.commit()
		db.refresh(answer_obj)
		results.append({
			"question_id": question.id,
			"answer_id": answer_obj.id,
			"is_correct": answer_obj.is_correct,
			"ai_feedback": getattr(answer_obj, "ai_feedback", None),
			"ai_error_analysis": getattr(answer_obj, "ai_error_analysis", None)
		})
	return {"submitted": True, "results": results}
