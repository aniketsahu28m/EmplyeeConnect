# EmployeeConnect

EmployeeConnect is a DBMS project for employee and operations management with a React frontend and Flask + MySQL backend.

## Tech Stack

- Frontend: React, Vite, TailwindCSS
- Backend: Flask, mysql-connector-python
- Database: MySQL

## Project Structure

- `client/`: frontend application
- `server/`: backend API and SQL scripts
- `server/db_setup.sql`: schema setup
- `server/init_data.sql`: seed data

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+
- MySQL 8+

## 1. Clone and Install

```bash
git clone https://github.com/aniketsahu28m/EmplyeeConnect.git
cd EmplyeeConnect
```

Install frontend dependencies:

```bash
cd client
npm install
cd ..
```

Install backend dependencies:

```bash
cd server
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS / Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Database Setup

1. Create database `ems_db` in MySQL.
2. Run schema and seed scripts from `server/`:

```sql
SOURCE db_setup.sql;
SOURCE init_data.sql;
```

3. Update credentials in `server/app.py` (`db_config`) if your local user/password differ.

## 3. Run (Development)

Start backend API on port 5000.

Windows PowerShell:

```powershell
cd server
.\.venv\Scripts\Activate.ps1
python app.py
```

macOS / Linux:

```bash
cd server
source .venv/bin/activate
python app.py
```

In another terminal, start frontend on port 5173:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## 4. Build (Production Frontend)

```bash
cd client
npm run build
```

Preview built frontend locally:

```bash
npm run preview
```

## 5. Tests

Backend tests are in `server/tests/` and use `pytest` with Flask test client.

Install test dependencies:

```bash
cd server
pip install -r requirements-dev.txt
```

Run tests:

```bash
pytest
```

## Notes

- This is an academic project and does not include production-grade auth/security hardening.
- Keep secrets out of source code for deployment.