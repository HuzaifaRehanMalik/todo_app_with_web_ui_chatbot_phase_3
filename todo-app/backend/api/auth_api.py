from datetime import datetime, timedelta
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session

from crud.user_crud import get_user_by_email, create_user, get_user_by_id
from database.database import get_session
from models.user_model import (
    User,
    UserCreate,
    UserLogin,
    UserPublic,
    ForgotPasswordRequest,
)

router = APIRouter()

# =========================
# Security Configuration
# =========================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

# Maximum number of bytes bcrypt accepts for a password
MAX_BCRYPT_INPUT_BYTES = 72

# ✅ FIX: bcrypt_sha256 handles long passwords safely
pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto"
)

# =========================
# Password Utilities
# =========================
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# =========================
# JWT Utilities
# =========================
def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# =========================
# Authentication Dependency
# =========================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_id(session, int(user_id))
    if user is None:
        raise credentials_exception
    return user


# =========================
# Authentication Logic
# =========================
def authenticate_user(
    session: Session,
    email: str,
    password: str
) -> Optional[User]:
    user = get_user_by_email(session, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# =========================
# Routes
# =========================
@router.post(
    "/auth/signup",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED
)
def signup(
    user_in: UserCreate,
    session: Session = Depends(get_session)
):
    try:
        existing_user = get_user_by_email(session, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        if len(user_in.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )

        # Ensure bcrypt's input limit is respected (72 bytes). Prefer explicit check
        if len(user_in.password.encode("utf-8")) > MAX_BCRYPT_INPUT_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Password is too long when UTF-8 encoded. "
                    f"Must be at most {MAX_BCRYPT_INPUT_BYTES} bytes."
                )
            )

        try:
            hashed_password = get_password_hash(user_in.password)
        except ValueError as e:
            # Defensive: bcrypt backend may raise for long inputs; map to 400
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        user = create_user(session, user_in, hashed_password)
        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@router.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = authenticate_user(
        session,
        email=form_data.username,
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserPublic.model_validate(user),
    }


@router.post("/auth/signin")
def signin(
    body: UserLogin,
    session: Session = Depends(get_session)
):
    user = authenticate_user(
        session,
        email=body.email,
        password=body.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserPublic.model_validate(user),
    }


@router.post("/auth/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    session: Session = Depends(get_session)
):
    # Always return a generic response (security best practice)
    _ = get_user_by_email(session, payload.email)

    return {
        "message": (
            "If an account with that email exists, "
            "a password reset link has been sent."
        )
    }
