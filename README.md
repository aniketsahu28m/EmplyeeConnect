# EmployeeConnect

EmployeeConnect is an employee management system built as a DBMS course project. It keeps a company's people, projects, tasks, attendance, payroll, clients and vendors in one MySQL database, with a React front end and a Flask API in between.

There are three kinds of users, and each sees a different part of the app:

| Role | What they can do |
|---|---|
| **Administrator** | Everything: manage employees, offices, payroll, clients, vendors and user roles, plus all projects, tasks and attendance |
| **Manager** | See the projects they lead, create and assign tasks, record attendance |
| **Employee** | See the tasks assigned to them and update their status |

Everyone can use **Team** to message colleagues, set up teams and share files.

## Features

- **Dashboard.** Headcount, project and task totals, plus open tasks sorted by due date with overdue ones flagged. Employees get a version limited to their own work.
- **Employees, offices, clients and vendors.** Create, edit, delete and filter records.
- **Projects and tasks.** Projects have a lead and a timeline. Tasks belong to a project and have an assignee, priority, deadline and status.
- **Attendance and payroll.** Daily attendance per employee. Monthly payroll with basic salary, deductions and net pay.
- **Separate sign-in tabs.** Administrators sign in on the *Administrator* tab, managers and employees on the *Staff* tab. The API rejects an account on the wrong tab.
- **Light and dark mode.** Follows the system setting until you choose one in the header.
- **Phone-friendly layout.** The sidebar becomes a slide-out menu on small screens.

## Tech stack

| Layer | Tools |
|---|---|
| Front end | React 18, React Router, Vite, Tailwind CSS, Axios |
| Back end | Python, Flask, Flask-CORS, mysql-connector-python |
| Database | MySQL 8 or newer |
| Tests | pytest with Flask's test client |

## Getting started (macOS)

### 1. Install the tools

You need [Homebrew](https://brew.sh). Then:

```bash
brew install mysql python node
```

Homebrew's MySQL `root` user has no password by default, which is what the app expects.

### 2. Clone and set up

```bash
git clone https://github.com/aniketsahu28m/EmplyeeConnect.git EmployeeConnect
cd EmployeeConnect
./setup.sh
```

`setup.sh` is safe to run more than once. It:

1. Starts MySQL (`brew services start mysql`).
2. Creates the `ems_db` database and its tables from `server/db_setup.sql`.
3. Loads sample data from `server/init_data.sql`, but only into an empty database.
4. Creates a Python virtual environment in `server/.venv` and installs the back-end packages.
5. Installs the front-end packages.

### 3. Run

```bash
./run.sh
```

This starts the API on http://localhost:8000 and the app on http://localhost:5173, then opens the app in your browser. Press `Ctrl+C` to stop both.

### Sample accounts

| Sign-in tab | Email | Password |
|---|---|---|
| Administrator | admin@example.com | admin123 |
| Staff | manager@example.com | manager123 |
| Staff | employee@example.com | employee123 |

New managers and employees can also register from the sign-up page.

### Running the servers yourself

If you'd rather use two terminals instead of `run.sh`:

```bash
cd server && source .venv/bin/activate && python app.py
```

```bash
cd client && npm run dev
```

## Project layout

```
EmployeeConnect/
├── setup.sh              One-time setup (MySQL, database, dependencies)
├── run.sh                Starts the API and the front end together
├── client/               React front end
│   ├── src/
│   │   ├── pages/        One file per screen (Dashboard, Employees, Tasks, …)
│   │   ├── components/   Layout, data table, form dialog, status labels
│   │   └── context/      Signed-in user and theme
│   ├── tailwind.config.js  Colour palette and light/dark theme
│   └── .env.example
└── server/               Flask API
    ├── app.py            All API routes
    ├── db_setup.sql      Database schema
    ├── init_data.sql     Sample data
    └── tests/            pytest tests
```

## Database

Everything lives in one MySQL database, `ems_db`. The schema in `server/db_setup.sql` has 17 tables:

| Area | Tables |
|---|---|
| People | `users`, `employee`, `user_roles` |
| Organisation | `office`, `clients`, `vendors` |
| Work | `projects`, `tasks`, `task_comments`, `project_reports` |
| Time and pay | `attendance`, `payroll` |
| Collaboration | `teams`, `team_members`, `messages`, `shared_files`, `file_permissions` |

`users` holds sign-in details and roles. `employee` adds job details such as department, designation, salary and joining date, and most other tables point to it. `task_comments`, `project_reports` and `file_permissions` are in the schema but the app doesn't use them yet.

## API

The Flask API serves JSON under `/api`. Most resources follow the same pattern:

| Method | Path | Action |
|---|---|---|
| `GET` | `/api/<resource>` | List all |
| `POST` | `/api/<resource>` | Create |
| `PUT` | `/api/<resource>/<id>` | Update |
| `DELETE` | `/api/<resource>/<id>` | Delete |

The resources are `employees`, `attendance`, `clients`, `offices`, `payroll`, `projects`, `tasks`, `user-roles` and `vendors`. The other routes are:

| Route | Purpose |
|---|---|
| `POST /api/login` | Sign in. Send `email`, `password` and `portal` (`admin` or `user`) |
| `POST /api/signup` | Register a manager or employee |
| `GET /api/dashboard/stats` | Totals for the dashboard |
| `GET /api/projects/manager/<employee_id>` | Projects led by one manager |
| `GET /api/tasks/employee/<employee_id>` | Tasks assigned to one employee |
| `GET, POST /api/messages` | Direct messages between two employees |
| `GET, POST /api/teams` | Teams |
| `GET, POST /api/shared_files` | Shared file links |
| `GET /api/users` | All user accounts |

## Configuration

**Database connection.** If your MySQL user or password isn't `root` with no password, change `db_config` near the top of `server/app.py`.

**API address.** The front end calls `http://localhost:8000` by default. To use a different back end, for example a deployed one, copy `client/.env.example` to `client/.env`, set `VITE_API_URL`, and rebuild.

## Tests and checks

```bash
cd server && .venv/bin/python -m pytest
```

The tests use a stub database, so they don't touch your data. They cover login (including which roles each sign-in tab accepts), listing employees and attendance validation.

```bash
cd client && npm run lint
```

```bash
cd client && npm run build
```

## Known limitations

This is a course project, not production software. Before anyone relies on it:

- **Passwords are stored in plain text.** They should be hashed, for example with bcrypt.
- **The API doesn't check who is calling.** Pages are hidden by role in the browser, but anyone who can reach the API can call any endpoint. It needs session or token authentication. `Flask-JWT-Extended` is already in `requirements.txt` but not used yet.
- **Anyone can sign up as a manager.** Normally an administrator would approve or assign that role.
- **The API runs on Flask's development server.** A deployment should use a production server such as gunicorn, with debug mode off.

## Author

Aniket Sahu
