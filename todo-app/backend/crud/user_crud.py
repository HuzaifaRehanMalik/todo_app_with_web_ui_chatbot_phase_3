from typing import Optional

from sqlmodel import Session, select

from models.user_model import User, UserCreate


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    """Get a user by their ID"""
    return session.get(User, user_id)


def create_user(session: Session, user_in: UserCreate, hashed_password: str) -> User:
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


