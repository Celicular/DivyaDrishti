# DivyaDrishti Backend API

Minimal FastAPI backend service with persistent SQLite storage, sequential SQL migration runner, and JWT authentication.

## Folder Structure

```text
backend/
├── migration/
│   ├── 001_create_users_table.sql
│   ├── __init__.py
│   └── runner.py
├── seeds/
│   ├── __init__.py
│   ├── demo_users.py
│   └── runner.py
├── auth.py
├── config.py
├── database.py
├── ddrishti.db
├── main.py
├── models.py
├── requirements.txt
├── .env
├── .env.example
└── .gitignore
```

## Setup & Running

```bash
cd backend
pip install -r requirements.txt
```

### Run Migrations & Seeds Manually (Optional)

Migrations and demo seeds run automatically on server startup. You can also run them manually:

```bash
python migration/runner.py
python seeds/runner.py
```

### Start Development Server

```bash
uvicorn main:app --reload --port 8000
```

### Docker Compose Deployment (VPS)

```bash
cd backend
cp .env.example .env
docker compose up -d --build
```

Interactive API documentation will be available at:
- Backend Swagger UI: `http://localhost:8000/docs`
- Backend ReDoc: `http://localhost:8000/redoc`
- Gemma Inference API: `http://localhost:9000/docs` (see `gemma/README.md` for details)



## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` or `/api/health` | Health check endpoint returning service and database status |
| `POST` | `/login` or `/api/login` | Authenticate user with credentials and return JWT token |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile using Bearer token |
| `GET` | `/api/users` | List demo accounts |

## Demo Accounts

All demo accounts share the password: `Demo@2026`

| ID | Username | Email | Role | Full Name |
|---|---|---|---|---|
| 1 | `field_lead` | `field.lead@ddrishti.local` | `field_auditor` | Aarav Sharma |
| 2 | `ngo_director` | `ngo.director@ddrishti.local` | `ngo_lead` | Priya Patel |
| 3 | `govt_inspector` | `govt.inspector@ddrishti.local` | `govt_mission` | Rajesh Verma |
| 4 | `esg_analyst` | `esg.analyst@ddrishti.local` | `sustainability` | Ananya Iyer |
| 5 | `donor_partner` | `donor.partner@ddrishti.local` | `donor_csr` | Vikram Malhotra |
