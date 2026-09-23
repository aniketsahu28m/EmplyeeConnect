#!/bin/bash
# One-time (and safe to re-run) setup for EmployeeConnect on macOS.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

step() { printf "\n\033[1;34m==> %s\033[0m\n" "$1"; }
fail() { printf "\033[1;31mError:\033[0m %s\n" "$1" >&2; exit 1; }

step "Checking required tools"
command -v brew >/dev/null || fail "Homebrew not found. Install it from https://brew.sh"
for tool in mysql:mysql python3:python node:node npm:node; do
  cmd="${tool%%:*}"; formula="${tool##*:}"
  command -v "$cmd" >/dev/null || fail "'$cmd' not found. Install it with: brew install $formula"
done
echo "brew, mysql, python3, node and npm are installed."

step "Starting MySQL"
if ! mysqladmin -u root ping --silent >/dev/null 2>&1; then
  brew services start mysql
  for _ in {1..20}; do
    mysqladmin -u root ping --silent >/dev/null 2>&1 && break
    sleep 1
  done
fi
mysqladmin -u root ping --silent >/dev/null 2>&1 \
  || fail "MySQL isn't responding. If your root user has a password, update db_config in server/app.py and run the SQL files manually (see README)."
echo "MySQL is running."

step "Creating database schema (ems_db)"
mysql -u root < "$SERVER_DIR/db_setup.sql"
USER_COUNT="$(mysql -N -u root ems_db -e 'SELECT COUNT(*) FROM users')"
if [ "$USER_COUNT" -eq 0 ]; then
  echo "Loading default data..."
  mysql -u root ems_db < "$SERVER_DIR/init_data.sql"
else
  echo "Database already has data, skipping default data."
fi

step "Setting up Python environment (server/.venv)"
if [ ! -x "$SERVER_DIR/.venv/bin/python" ] || ! "$SERVER_DIR/.venv/bin/python" -c "" 2>/dev/null; then
  rm -rf "$SERVER_DIR/.venv"
  python3 -m venv "$SERVER_DIR/.venv"
fi
"$SERVER_DIR/.venv/bin/python" -m pip install --quiet --upgrade pip
"$SERVER_DIR/.venv/bin/python" -m pip install --quiet -r "$SERVER_DIR/requirements-dev.txt"
echo "Python packages installed."

step "Installing frontend packages (client/node_modules)"
(cd "$CLIENT_DIR" && npm install --no-fund --no-audit)

printf "\n\033[1;32mSetup complete.\033[0m Start the app with: ./run.sh\n"
