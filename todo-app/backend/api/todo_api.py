from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session
from typing import List
from database.database import get_session
from models.todo_model import Todo, TodoCreate, TodoUpdate, TodoPublic
from models.user_model import User
from api.auth_api import get_current_user
from crud.todo_crud import (
    create_todo, get_todo_by_id, get_all_todos,
    update_todo, delete_todo, complete_todo
)

router = APIRouter()


@router.post("/todos/", response_model=TodoPublic, status_code=status.HTTP_201_CREATED)
def create_new_todo(
    todo: TodoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new todo item for the current user"""
    try:
        db_todo = create_todo(session, todo, current_user.id)
        return db_todo
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating todo: {str(e)}"
        )


@router.get("/todos/", response_model=List[TodoPublic])
def read_todos(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all todos for the current user with optional pagination"""
    try:
        todos = get_all_todos(session, current_user.id, skip=skip, limit=limit)
        return todos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving todos: {str(e)}"
        )


@router.get("/todos/{todo_id}", response_model=TodoPublic)
def read_todo(
    todo_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific todo by ID for the current user"""
    try:
        db_todo = get_todo_by_id(session, todo_id, current_user.id)
        if not db_todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found"
            )
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving todo: {str(e)}"
        )


@router.put("/todos/{todo_id}", response_model=TodoPublic)
def update_existing_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update a specific todo by ID for the current user"""
    try:
        db_todo = update_todo(session, todo_id, todo_update, current_user.id)
        if not db_todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found"
            )
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating todo: {str(e)}"
        )


@router.patch("/todos/{todo_id}/complete", response_model=TodoPublic)
def complete_existing_todo(
    todo_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific todo as completed for the current user"""
    try:
        db_todo = complete_todo(session, todo_id, current_user.id)
        if not db_todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found"
            )
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing todo: {str(e)}"
        )


@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_todo(
    todo_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific todo by ID for the current user"""
    try:
        success = delete_todo(session, todo_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found"
            )
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting todo: {str(e)}"
        )