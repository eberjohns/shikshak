
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, exams, courses, grading, dashboard

app = FastAPI()

# CORS setup for frontend
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:9002"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(courses.router)
app.include_router(grading.router)
app.include_router(dashboard.router)
