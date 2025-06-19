# backend/App/routes/database.py (example)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.App.models import Base

DATABASE_URL = "postgresql://postgres:yourpassword@localhost:5432/mydatabase"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables at app startup (run once)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
