import sqlite3
import sys
from pathlib import Path
from typing import List, Dict, Any

SEEDS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SEEDS_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.auth import hash_password
    from backend.seeds.demo_users import DEMO_ACCOUNTS
except ImportError:
    from auth import hash_password
    from seeds.demo_users import DEMO_ACCOUNTS

def run_seeds(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    seeded = []
    for account in DEMO_ACCOUNTS:
        cursor.execute(
            "SELECT id, username, email, full_name, role FROM users WHERE email = ? OR username = ?",
            (account["email"], account["username"])
        )
        existing = cursor.fetchone()
        if not existing:
            pwd_hash = hash_password(account["password"])
            cursor.execute(
                """
                INSERT INTO users (email, username, password_hash, full_name, role)
                VALUES (?, ?, ?, ?, ?)
                """,
                (account["email"], account["username"], pwd_hash, account["full_name"], account["role"])
            )
            seeded.append(account)
    conn.commit()
    return seeded

if __name__ == "__main__":
    try:
        from backend.database import get_connection
    except ImportError:
        from database import get_connection
    connection = get_connection()
    results = run_seeds(connection)
    connection.close()
    if results:
        for r in results:
            print(f"Seeded: {r['username']}")
    else:
        print("Demo accounts already present.")
