# backend/App/routes/auth.py
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.App.models import User
from backend.App.routes.schemas import UserCreate
from backend.App.routes.database import get_db
from backend.App.utils.password_utils import hash_password
from fastapi.security import HTTPBasicCredentials
from backend.App.utils.password_utils import verify_password  # Assuming you have a function to verify passwords
from fastapi import APIRouter, Response, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Credentials(BaseModel):
    email: str
    password: str

from fastapi import Request, HTTPException, Depends
from backend.App.models import User
from backend.App.routes.database import get_db
from sqlalchemy.orm import Session

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("user_id")
    return {"message": "Logged out"}


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

@router.post("/check-credentials")
async def check_credentials(
    credentials: Credentials,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        return JSONResponse(status_code=400, content={"exists": False, "message": "Invalid email or password"})

    json_response = JSONResponse(content={"exists": True, "message": "Logged in"})
    print(f"Setting cookie for user_id: {user.id}")

    json_response.set_cookie(
        key="user_id",
        value=str(user.id),
        httponly=True,
        samesite="lax",  # lowercase "lax"
        secure=False,    # False for localhost
        path="/",        # explicit path
        domain=None,     # let it default
        max_age=86400    # 24 hours expiry
    )
    print(f"Response will have Set-Cookie header")

    return json_response
