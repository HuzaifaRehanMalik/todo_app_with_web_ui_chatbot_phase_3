from sqlmodel import Session, select
from models.todo_model import Todo, TodoCreate, TodoUpdate
from typing import List, Optional


def create_todo(session: Session, todo: TodoCreate, user_id: int) -> Todo:
    """Create a new todo item for a specific user"""
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        user_id=user_id
    )
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


def get_todo_by_id(session: Session, todo_id: int, user_id: int) -> Optional[Todo]:
    """Get a todo by its ID, ensuring it belongs to the user"""
    db_todo = session.get(Todo, todo_id)
    if db_todo and db_todo.user_id == user_id:
        return db_todo
    return None


def get_all_todos(session: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Todo]:
    """Get all todos for a specific user with optional pagination"""
    statement = select(Todo).where(Todo.user_id == user_id).offset(skip).limit(limit)
    todos = session.exec(statement).all()
    return todos


def update_todo(session: Session, todo_id: int, todo_update: TodoUpdate, user_id: int) -> Optional[Todo]:
    """Update a todo item, ensuring it belongs to the user"""
    from datetime import datetime
    
    db_todo = session.get(Todo, todo_id)
    if not db_todo or db_todo.user_id != user_id:
        return None

    todo_data = todo_update.model_dump(exclude_unset=True)
    for key, value in todo_data.items():
        setattr(db_todo, key, value)
    
    # Update the updated_at timestamp
    db_todo.updated_at = datetime.utcnow()

    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


def delete_todo(session: Session, todo_id: int, user_id: int) -> bool:
    """Delete a todo item, ensuring it belongs to the user"""
    db_todo = session.get(Todo, todo_id)
    if not db_todo or db_todo.user_id != user_id:
        return False

    session.delete(db_todo)
    session.commit()
    return True


def complete_todo(session: Session, todo_id: int, user_id: int) -> Optional[Todo]:
    """Mark a todo as completed, ensuring it belongs to the user"""
    from datetime import datetime
    
    db_todo = session.get(Todo, todo_id)
    if not db_todo or db_todo.user_id != user_id:
        return None

    db_todo.completed = True
    db_todo.updated_at = datetime.utcnow()
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo