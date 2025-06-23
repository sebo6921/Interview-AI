from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.App.routes.auth import router as auth_router
from backend.App.routes.startInterview import router as start_interview_router
from backend.App.routes.generateAnw import router as generate_answer_router
from backend.App.routes.cv import router as pdf_to_text_router
from backend.App.routes.auth import router as login
load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend URL and port
    allow_credentials=True,                    # THIS IS CRITICAL to allow cookies cross-origin
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(start_interview_router, prefix="/api")
app.include_router(generate_answer_router, prefix="/api")
app.include_router(pdf_to_text_router, prefix="/api")
