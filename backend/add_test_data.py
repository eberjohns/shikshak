import json
from app.database import SessionLocal
from app.models import Exam, Course, Question, QuestionType, Answer, User, Topic

db = SessionLocal()

# Ensure course, student, and teacher exist
course = db.query(Course).filter(Course.id == 2).first()
student = db.query(User).filter(User.id == 3).first()
if not course or not student:
    print("Course or student not found.")
    exit(1)


# Create topic
topic = Topic(name="Cell Biology")
db.add(topic)
db.commit()
db.refresh(topic)

# Create exam
exam = Exam(title="Unit 1 Test", course_id=course.id)
db.add(exam)
db.commit()
db.refresh(exam)

# Create question linked to topic
question = Question(
    exam_id=exam.id,
    question_text="What is the powerhouse of the cell?",
    question_type=QuestionType.objective,
    options=json.dumps({"A": "Nucleus", "B": "Mitochondria", "C": "Ribosome", "D": "Chloroplast"}),
    correct_option="B",
    topic_id=topic.id
)
db.add(question)
db.commit()
db.refresh(question)

# Add answer for student
answer = Answer(
    question_id=question.id,
    student_id=student.id,
    answer_text="B",
    is_correct="true",
    score=1.0
)
db.add(answer)
db.commit()
print(f"Added exam, question, and answer for student {student.id}.")
