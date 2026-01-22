"""
Migration script to add user_id column to todo table
Run this script once to update your database schema
"""
from sqlmodel import create_engine, text
from database.database import DATABASE_URL, engine
import sys

def migrate_add_user_id():
    """Add user_id column to todo table"""
    try:
        with engine.connect() as conn:
            # Check if column already exists
            if DATABASE_URL.startswith("sqlite"):
                # SQLite syntax
                result = conn.execute(text("PRAGMA table_info(todo)"))
                columns = [row[1] for row in result.fetchall()]
                
                if "user_id" in columns:
                    print("[OK] Column 'user_id' already exists in todo table")
                    return
                
                # Delete existing todos since they don't belong to any user
                print("[WARNING] Deleting existing todos (they don't have user_id)...")
                conn.execute(text("DELETE FROM todo"))
                conn.commit()
                
                # Add user_id column
                print("Adding user_id column to todo table...")
                conn.execute(text("ALTER TABLE todo ADD COLUMN user_id INTEGER"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_todo_user_id ON todo(user_id)"))
                conn.commit()
                print("[OK] Successfully added user_id column to todo table")
                
            else:
                # PostgreSQL syntax
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='todo' AND column_name='user_id'
                """))
                
                if result.fetchone():
                    print("[OK] Column 'user_id' already exists in todo table")
                    return
                
                # Delete existing todos since they don't belong to any user
                print("[WARNING] Deleting existing todos (they don't have user_id)...")
                conn.execute(text("DELETE FROM todo"))
                conn.commit()
                
                # Add user_id column with foreign key
                print("Adding user_id column to todo table...")
                conn.execute(text("ALTER TABLE todo ADD COLUMN user_id INTEGER"))
                conn.execute(text("ALTER TABLE todo ADD CONSTRAINT fk_todo_user_id FOREIGN KEY (user_id) REFERENCES user(id)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_todo_user_id ON todo(user_id)"))
                conn.commit()
                print("[OK] Successfully added user_id column to todo table")
                
    except Exception as e:
        print(f"[ERROR] Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Running migration: Add user_id to todo table")
    print("=" * 50)
    migrate_add_user_id()
    print("=" * 50)
    print("Migration completed!")
