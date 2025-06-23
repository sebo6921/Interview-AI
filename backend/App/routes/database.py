# backend/App/routes/database.py (example)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.App.models import Base
from sqlalchemy.orm import Session
import json
from backend.App.models import User

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

def update_user_cv_data(db: Session, user_id: int, data: dict):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise Exception("User not found")

    print("\n🔍 Updating user CV fields:")
    
    if data.get("full_name"):
        user.full_name = data["full_name"]
        print("✅ full_name:", user.full_name)
    else:
        print("❌ full_name is empty")

    if data.get("phone"):
        user.phone = data["phone"]
        print("✅ phone:", user.phone)
    else:
        print("❌ phone is empty")

    if data.get("skills"):
        user.skills = json.dumps(data["skills"])
        print("✅ skills:", user.skills)
    else:
        print("❌ skills are empty")

    if data.get("education"):
        user.education = json.dumps(data["education"])
        print("✅ education:", user.education)
    else:
        print("❌ education is empty")

    if data.get("work_experience"):
        user.work_experience = json.dumps(data["work_experience"])
        print("✅ work_experience:", user.work_experience)
    else:
        print("❌ work_experience is empty")

    if data.get("other_info"):
        user.other_info = json.dumps(data["other_info"])
        print("✅ other_info:", user.other_info)
    else:
        print("❌ other_info is empty")

    db.commit()
    db.refresh(user)

    print("📝 Finished updating user with ID:", user.id)
    return user
