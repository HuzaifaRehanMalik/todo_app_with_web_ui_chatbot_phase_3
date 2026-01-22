from sqlmodel import create_engine, Session
from typing import Generator
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Create the database engine
# For PostgreSQL/Neon, use the provided URL
# For SQLite (default for local development), use the file-based database
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Enable foreign key support in SQLite
    from sqlalchemy import event
    engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)
    
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    connect_args = {}
    engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session