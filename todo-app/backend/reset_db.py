from sqlmodel import text
from database.database import engine

def reset_db():
    print("Resetting database...")
    try:
        with engine.connect() as conn:
            print("Dropping todo table...")
            conn.execute(text("DROP TABLE IF EXISTS todo CASCADE"))
            conn.commit()
            print("[OK] Dropped todo table.")
    except Exception as e:
        print(f"[ERROR] Failed to reset DB: {e}")

if __name__ == "__main__":
    reset_db()
# done