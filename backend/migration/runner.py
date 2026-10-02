import os
import sqlite3
import sys
from pathlib import Path
from typing import List

MIGRATIONS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = MIGRATIONS_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.config import DB_PATH
except ImportError:
    from config import DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def ensure_migration_table(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT UNIQUE NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

def get_applied_migrations(conn: sqlite3.Connection) -> List[str]:
    cursor = conn.cursor()
    cursor.execute("SELECT version FROM schema_migrations ORDER BY id ASC")
    rows = cursor.fetchall()
    return [row["version"] for row in rows]

def run_migrations(connection: sqlite3.Connection = None) -> List[str]:
    owns_connection = False
    if connection is None:
        connection = get_connection()
        owns_connection = True

    ensure_migration_table(connection)
    applied = set(get_applied_migrations(connection))
    
    migration_files = sorted(
        [f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql")]
    )

    newly_applied = []
    cursor = connection.cursor()

    for file_name in migration_files:
        if file_name not in applied:
            file_path = MIGRATIONS_DIR / file_name
            with open(file_path, "r", encoding="utf-8") as f:
                sql_content = f.read()

            cursor.executescript(sql_content)
            cursor.execute(
                "INSERT INTO schema_migrations (version) VALUES (?)",
                (file_name,)
            )
            connection.commit()
            newly_applied.append(file_name)

    if owns_connection:
        connection.close()

    return newly_applied

if __name__ == "__main__":
    applied = run_migrations()
    if applied:
        for m in applied:
            print(f"Applied migration: {m}")
    else:
        print("No pending migrations. Schema is up to date.")
