from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.App.routes.auth import router as auth_router
from backend.App.routes.startInterview import router as start_interview_router
from backend.App.routes.generateAnw import router as generate_answer_router

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(start_interview_router, prefix="/api")
app.include_router(generate_answer_router, prefix="/api")
