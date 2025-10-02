from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Answer

router = APIRouter()

# Teacher approves or overrides AI grading for a subjective answer
@router.post("/teacher/grade/review")
def review_grading(answer_id: int, score: float, final_feedback: str, is_correct: str = "true"):
	db: Session = SessionLocal()
	answer = db.query(Answer).filter(Answer.id == answer_id).first()
	if not answer:
		raise HTTPException(status_code=404, detail="Answer not found")
	answer.score = score
	answer.final_feedback = final_feedback
	answer.is_correct = is_correct
	db.commit()
	db.refresh(answer)
	return {"answer_id": answer.id, "score": answer.score, "final_feedback": answer.final_feedback, "is_correct": answer.is_correct}
