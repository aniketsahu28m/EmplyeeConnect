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

## Prerequisites (macOS)

Install [Homebrew](https://brew.sh), then:

```bash
brew install mysql python node
```

This gives you MySQL 8+, Python 3.10+ and Node.js 18+ with npm. Homebrew's MySQL `root` user has no password by default, which is what the app expects.

## 1. Clone and Set Up

```bash
git clone https://github.com/aniketsahu28m/EmplyeeConnect.git EmployeeConnect
cd EmployeeConnect
./setup.sh
```

`setup.sh` is safe to re-run. It:

- starts MySQL (`brew services start mysql`)
- creates the `ems_db` database from `server/db_setup.sql`
- loads the default data from `server/init_data.sql`, only if the database has no users yet
- creates the Python environment in `server/.venv` and installs the backend packages
- installs the frontend packages in `client/node_modules`

If your MySQL user or password differ from the defaults, update `db_config` in `server/app.py`:

```python
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'ems_db'
}
```

## 2. Run

```bash
./run.sh
```

This starts MySQL if needed, the backend API on `http://localhost:8000` and the frontend on `http://localhost:5173`, then opens the app in your browser. Press `Ctrl+C` to stop everything.

Default accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| Employee | employee@example.com | employee123 |

To start the two servers separately instead, in two terminals:

```bash
cd server && source .venv/bin/activate && python app.py
```

```bash
cd client && npm run dev
```

## 3. Build (Production Frontend)

```bash
cd client
npm run build
```

Preview built frontend locally:

```bash
npm run preview
```

## 4. Tests

Backend tests are in `server/tests/` and use `pytest` with Flask test client.

Test dependencies are installed by `setup.sh`. Run the tests with:

```bash
cd server && .venv/bin/python -m pytest
```

## Configuration

The frontend calls the backend at `http://localhost:8000` by default. To point it at a deployed backend, copy `client/.env.example` to `client/.env` and set `VITE_API_URL`, then rebuild.

## Notes

- The login page has **User** and **Admin** tabs. Admin accounts can only sign in from the Admin tab, and managers and employees only from the User tab.
- Light and dark mode: use the sun/moon button in the header. The app follows your system setting until you choose.

- This is an academic project and does not include production-grade auth/security hardening.
- Keep secrets out of source code for deployment.