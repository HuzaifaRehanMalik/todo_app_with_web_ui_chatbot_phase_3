"""
Migration script to add completed column to todo table
Run this script once to update your database schema
"""
from sqlmodel import create_engine, text
from database.database import DATABASE_URL, engine
import sys

def migrate_add_completed():
    """Add completed column to todo table"""
    try:
        with engine.connect() as conn:
            # Check if column already exists
            if DATABASE_URL.startswith("sqlite"):
                # SQLite syntax
                result = conn.execute(text("PRAGMA table_info(todo)"))
                columns = [row[1] for row in result.fetchall()]
                
                if "completed" in columns:
                    print("[OK] Column 'completed' already exists in todo table")
                    return
                
                # Add completed column
                print("Adding completed column to todo table...")
                conn.execute(text("ALTER TABLE todo ADD COLUMN completed BOOLEAN DEFAULT 0"))
                conn.commit()
                print("[OK] Successfully added completed column to todo table")
                
            else:
                # PostgreSQL syntax
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='todo' AND column_name='completed'
                """))
                
                if result.fetchone():
                    print("[OK] Column 'completed' already exists in todo table")
                    return
                
                # Add completed column
                print("Adding completed column to todo table...")
                conn.execute(text("ALTER TABLE todo ADD COLUMN completed BOOLEAN DEFAULT FALSE"))
                conn.commit()
                print("[OK] Successfully added completed column to todo table")
                
    except Exception as e:
        print(f"[ERROR] Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Running migration: Add completed to todo table")
    print("=" * 50)
    migrate_add_completed()
    print("=" * 50)
    print("Migration completed!")
