from fastapi import APIRouter, HTTPException, Depends, Response
from sqlmodel import Session
from typing import List
import os
from datetime import datetime
from database.database import get_session
from models.todo_model import Todo
from models.user_model import User
from api.auth_api import get_current_user
from crud.todo_crud import get_all_todos

router = APIRouter()


@router.get("/export/todos")
def export_todos_to_txt(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Export all todos for the current user to a .txt file on the desktop"""
    try:
        # Get all todos for the current user
        todos = get_all_todos(session, current_user.id)

        if not todos:
            raise HTTPException(
                status_code=404,
                detail="No todos found to export"
            )

        # Create the content for the text file
        content = f"Todo Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        content += "=" * 50 + "\n\n"

        for i, todo in enumerate(todos, 1):
            status = "COMPLETED" if todo.completed else "PENDING"
            content += f"{i}. [{status}] {todo.title}\n"
            if todo.description:
                content += f"   Description: {todo.description}\n"
            content += f"   Created: {todo.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            content += f"   Updated: {todo.updated_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            content += "-" * 30 + "\n"

        # Determine the desktop path
        desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
        file_path = os.path.join(desktop_path, f"todos_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")

        # Write the content to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)

        # Return a response indicating success
        return {
            "message": f"Successfully exported {len(todos)} todos to {file_path}",
            "file_path": file_path,
            "exported_count": len(todos)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting todos: {str(e)}"
        )