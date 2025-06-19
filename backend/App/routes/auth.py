# backend/App/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.App.models import User
from backend.App.routes.schemas import UserCreate
from backend.App.routes.database import get_db
from backend.App.utils.password_utils import hash_password

router = APIRouter()

@router.post("/signup")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    print("Received:", user_data)

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"User with email {user_data.email} already exists.")
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(new_user.id, new_user.email)
    return {"msg": "User created", "user_id": new_user.id}
