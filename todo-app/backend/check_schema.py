from sqlmodel import create_engine, text
from database.database import engine
import sys

def check_schema():
    print("Checking database schema...")
    try:
        with engine.connect() as conn:
            # Check for PostgreSQL
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='todo'
            """))
            columns = [row[0] for row in result.fetchall()]
            
            print(f"Found columns in 'todo' table: {columns}")
            
            missing = []
            if "user_id" not in columns:
                missing.append("user_id")
            if "completed" not in columns:
                missing.append("completed")
            
            if missing:
                print(f"[ERROR] Missing columns: {missing}")
                sys.exit(1)
            else:
                print("[OK] All required columns exist.")
                
    except Exception as e:
        print(f"[ERROR] Failed to check schema: {e}")
        # Fallback for SQLite if that's what's being used
        try:
            with engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(todo)"))
                columns = [row[1] for row in result.fetchall()]
                print(f"Found columns in 'todo' table (SQLite): {columns}")
                 
                missing = []
                if "user_id" not in columns:
                    missing.append("user_id")
                if "completed" not in columns:
                    missing.append("completed")
                
                if missing:
                    print(f"[ERROR] Missing columns: {missing}")
                    sys.exit(1)
                else:
                    print("[OK] All required columns exist.")
        except Exception as e2:
             print(f"[ERROR] Failed to check schema (SQLite fallback): {e2}")
             sys.exit(1)

if __name__ == "__main__":
    check_schema()
