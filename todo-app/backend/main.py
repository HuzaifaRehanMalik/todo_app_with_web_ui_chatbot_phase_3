from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from api.todo_api import router as todo_router
from api.export_api import router as export_router
from api.auth_api import router as auth_router
from database.database import engine
from models.todo_model import Todo
from models.user_model import User
from sqlmodel import SQLModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup"""
    SQLModel.metadata.create_all(engine)
    yield
    # Any cleanup code can go here


# Create the FastAPI app
app = FastAPI(
    title="Todo API",
    description="A simple todo application backend with FastAPI and SQLModel",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],  # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Expose headers that the frontend might need to access
    expose_headers=["Access-Control-Allow-Origin", "Content-Range", "X-Content-Range"],
)

# Include the API routers
app.include_router(todo_router, prefix="/api/v1", tags=["todos"])
app.include_router(export_router, prefix="/api/v1", tags=["export"])
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
from api.chat_api import router as chat_router
app.include_router(chat_router, prefix="/api/v1", tags=["chat"])


@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Welcome to the Todo API", "status": "running"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Todo API is running"}


def main():
    import uvicorn
    port = int(os.getenv("PORT", "7860"))
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()
