from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlmodel import Session
import os
from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled

from database.database import get_session
from models.todo_model import Todo
from models.user_model import User
from api.auth_api import get_current_user
from crud.todo_crud import get_all_todos

# Gemini exposes an OpenAI-compatible endpoint, so the OpenAI Agents SDK can drive it directly
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

# Tracing uploads to OpenAI and would require an OpenAI key, so turn it off
set_tracing_disabled(True)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_todos(
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Chat with an AI that knows about your todos.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key not configured"
        )

    try:
        client = AsyncOpenAI(api_key=api_key, base_url=GEMINI_BASE_URL)
        model = OpenAIChatCompletionsModel(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            openai_client=client
        )

        # Fetch user's todos
        todos = get_all_todos(session, current_user.id)

        # Format todos for the prompt
        todo_list_str = "\n".join([
            f"- {t.title} ({'Completed' if t.completed else 'Pending'}): {t.description or 'No description'}"
            for t in todos
        ])

        system_prompt = f"""You are a helpful productivity assistant.
The user has the following todos:
{todo_list_str}

Answer the user's questions based on their todos. Give helpful tips on how to complete them.
If the user asks about something unrelated to their todos, politely steer them back to productivity or answer generally if appropriate.
Keep your answers concise and encouraging.
"""

        agent = Agent(
            name="Todo Assistant",
            instructions=system_prompt,
            model=model
        )

        result = await Runner.run(agent, request.message)
        return ChatResponse(response=result.final_output)

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )
