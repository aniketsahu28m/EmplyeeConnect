import importlib

import pytest

app_module = importlib.import_module("app")


class StubCursor:
    def __init__(self, fetchone_results=None, fetchall_results=None):
        self.fetchone_results = list(fetchone_results or [])
        self.fetchall_results = fetchall_results if fetchall_results is not None else []

    def execute(self, query, params=None):
        self.last_query = query
        self.last_params = params

    def fetchone(self):
        if self.fetchone_results:
            return self.fetchone_results.pop(0)
        return None

    def fetchall(self):
        return self.fetchall_results

    def close(self):
        pass


class StubConn:
    def __init__(self, cursor):
        self._cursor = cursor

    def cursor(self, dictionary=False):
        return self._cursor

    def is_connected(self):
        return True

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        pass


@pytest.fixture
def client():
    app_module.app.config["TESTING"] = True
    with app_module.app.test_client() as test_client:
        yield test_client


def test_login_success(client, monkeypatch):
    user = {
        "user_id": 1,
        "email": "admin@example.com",
        "role": "Admin",
        "first_name": "Admin",
        "last_name": "User",
    }
    stub_cursor = StubCursor(fetchone_results=[user])
    monkeypatch.setattr(app_module, "get_db_connection", lambda: StubConn(stub_cursor))

    response = client.post(
        "/api/login",
        json={"email": "admin@example.com", "password": "admin123"},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["user"]["id"] == 1


def test_login_invalid_credentials(client, monkeypatch):
    stub_cursor = StubCursor(fetchone_results=[None])
    monkeypatch.setattr(app_module, "get_db_connection", lambda: StubConn(stub_cursor))

    response = client.post(
        "/api/login",
        json={"email": "missing@example.com", "password": "bad"},
    )

    assert response.status_code == 401
    assert response.get_json()["error"] == "Invalid credentials"


def test_get_employees_returns_list(client, monkeypatch):
    employees = [{"employee_id": 1, "first_name": "A", "last_name": "B"}]
    stub_cursor = StubCursor(fetchall_results=employees)
    monkeypatch.setattr(app_module, "get_db_connection", lambda: StubConn(stub_cursor))

    response = client.get("/api/employees")

    assert response.status_code == 200
    assert response.get_json() == employees


def test_create_attendance_requires_payload(client, monkeypatch):
    monkeypatch.setattr(app_module, "get_db_connection", lambda: StubConn(StubCursor()))

    response = client.post("/api/attendance", json={})

    assert response.status_code == 400
    assert response.get_json()["error"] == "No data provided"


def test_create_attendance_duplicate_record(client, monkeypatch):
    stub_cursor = StubCursor(fetchone_results=[{"attendance_id": 10}])
    monkeypatch.setattr(app_module, "get_db_connection", lambda: StubConn(stub_cursor))

    response = client.post(
        "/api/attendance",
        json={"employee_id": 2, "date": "2026-08-07", "status": "Present"},
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "Attendance record already exists for this date"


def _user(role):
    return {
        "user_id": 1,
        "email": f"{role.lower()}@example.com",
        "role": role,
        "first_name": role,
        "last_name": "User",
    }


@pytest.mark.parametrize(
    "role, portal, expected_status",
    [
        ("Admin", "admin", 200),
        ("Manager", "user", 200),
        ("Employee", "user", 200),
        ("Manager", "admin", 403),
        ("Employee", "admin", 403),
        ("Admin", "user", 403),
    ],
)
def test_login_portal_must_match_role(client, monkeypatch, role, portal, expected_status):
    stub_cursor = StubCursor(fetchone_results=[_user(role)])
    monkeypatch.setattr(app_module, "get_db_connection", lambda: StubConn(stub_cursor))

    response = client.post(
        "/api/login",
        json={"email": f"{role.lower()}@example.com", "password": "secret", "portal": portal},
    )

    assert response.status_code == expected_status
    if expected_status == 403:
        assert "tab" in response.get_json()["error"]
