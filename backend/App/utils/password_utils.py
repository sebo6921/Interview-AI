from passlib.context import CryptContext

# Create a bcrypt context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash the user's password (used during signup)
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify a plain password against a hashed one (used during login)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
