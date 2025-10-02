from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Answer, Question, Topic, Course, User

router = APIRouter()

# Student dashboard: topic-wise accuracy and error types
@router.get("/dashboard/student")
def student_dashboard(student_id: int):
    db: Session = SessionLocal()
    answers = db.query(Answer).filter(Answer.student_id == student_id).all()
    topic_stats = {}
    for ans in answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if not question or not question.topic_id:
            continue
        topic = db.query(Topic).filter(Topic.id == question.topic_id).first()
        if not topic:
            continue
        if topic.name not in topic_stats:
            topic_stats[topic.name] = {"total": 0, "correct": 0, "errors": {}}
        topic_stats[topic.name]["total"] += 1
        if ans.is_correct == "true":
            topic_stats[topic.name]["correct"] += 1
        else:
            err_type = ans.ai_error_analysis or "none"
            topic_stats[topic.name]["errors"].setdefault(err_type, 0)
            topic_stats[topic.name]["errors"][err_type] += 1
    # Format output
    dashboard = []
    for topic, stats in topic_stats.items():
        accuracy = round(100 * stats["correct"] / stats["total"], 2) if stats["total"] else 0
        dashboard.append({
            "topic": topic,
            "accuracy": accuracy,
            "common_errors": stats["errors"]
        })
    return {"topics": dashboard}

# Teacher dashboard: class performance, misunderstood topics, student highlights
@router.get("/dashboard/teacher/{course_id}")
def teacher_dashboard(course_id: int):
    db: Session = SessionLocal()
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    exams = db.query(Question).filter(Question.exam_id.in_([e.id for e in course.exams])).all()
    topic_stats = {}
    student_scores = {}
    for q in exams:
        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()
        answers = db.query(Answer).filter(Answer.question_id == q.id).all()
        for ans in answers:
            student_scores.setdefault(ans.student_id, []).append(ans.score)
            if topic:
                if topic.name not in topic_stats:
                    topic_stats[topic.name] = {"total": 0, "errors": {}}
                topic_stats[topic.name]["total"] += 1
                if ans.is_correct != "true":
                    err_type = ans.ai_error_analysis or "none"
                    topic_stats[topic.name]["errors"].setdefault(err_type, 0)
                    topic_stats[topic.name]["errors"][err_type] += 1
    # Class average
    all_scores = [sum(scores)/len(scores) for scores in student_scores.values() if scores]
    class_avg = round(sum(all_scores)/len(all_scores), 2) if all_scores else 0
    # Top misunderstood topics
    misunderstood = sorted(topic_stats.items(), key=lambda x: sum(x[1]["errors"].values()), reverse=True)[:3]
    misunderstood_topics = [{"topic": t, "errors": stats["errors"]} for t, stats in misunderstood]
    # Student highlights
    student_highlights = []
    for sid, scores in student_scores.items():
        avg_score = round(sum(scores)/len(scores), 2) if scores else 0
        student = db.query(User).filter(User.id == sid).first()
        student_highlights.append({"student_id": sid, "name": student.name if student else "", "avg_score": avg_score})
    student_highlights = sorted(student_highlights, key=lambda x: x["avg_score"])[:3]
    return {
        "class_average": class_avg,
        "misunderstood_topics": misunderstood_topics,
        "student_highlights": student_highlights
    }
