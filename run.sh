#!/bin/bash
# Start EmployeeConnect on macOS. Press Ctrl+C to stop everything.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
FRONTEND_URL="http://localhost:5173"

fail() { printf "\033[1;31mError:\033[0m %s\n" "$1" >&2; exit 1; }

# First run (or broken environment): do the setup automatically.
if [ ! -x "$SERVER_DIR/.venv/bin/python" ] || [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo "Dependencies missing, running setup first..."
  "$ROOT_DIR/setup.sh"
fi

if ! mysqladmin -u root ping --silent >/dev/null 2>&1; then
  echo "Starting MySQL..."
  brew services start mysql >/dev/null
  for _ in {1..20}; do
    mysqladmin -u root ping --silent >/dev/null 2>&1 && break
    sleep 1
  done
  mysqladmin -u root ping --silent >/dev/null 2>&1 || fail "MySQL didn't start. Try: brew services restart mysql"
fi

mysql -u root -e "USE ems_db" 2>/dev/null || {
  echo "Database ems_db not found, running setup..."
  "$ROOT_DIR/setup.sh"
}

for port in 8000 5173; do
  if lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
    fail "Port $port is already in use (EmployeeConnect may already be running). Stop it with: kill \$(lsof -t -iTCP:$port -sTCP:LISTEN)"
  fi
done

PIDS=()
cleanup() {
  echo
  echo "Stopping EmployeeConnect..."
  for pid in ${PIDS[@]+"${PIDS[@]}"}; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 0' INT TERM

echo "Starting backend on http://localhost:8000 ..."
(cd "$SERVER_DIR" && exec .venv/bin/python app.py) &
PIDS+=($!)

echo "Starting frontend on $FRONTEND_URL ..."
(cd "$CLIENT_DIR" && exec ./node_modules/.bin/vite --host 0.0.0.0) &
PIDS+=($!)

# Open the browser once the frontend responds.
for _ in {1..30}; do
  curl -s -o /dev/null "$FRONTEND_URL" && break
  sleep 1
done
open "$FRONTEND_URL"

echo
echo "EmployeeConnect is running at $FRONTEND_URL  (press Ctrl+C to stop)"
wait
