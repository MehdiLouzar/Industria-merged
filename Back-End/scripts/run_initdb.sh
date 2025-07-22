#!/usr/bin/env bash
# Populate the PostgreSQL database using the initDB.sql file
set -euo pipefail

# Configuration via environment variables with sensible defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-industria}
SQL_FILE="${SQL_FILE:-$(dirname "$0")/../db/init/initDB.sql}"

# Ensure psql is available
if ! command -v psql >/dev/null; then
  echo "psql command not found. Please install PostgreSQL client tools." >&2
  exit 1
fi

# Require PGPASSWORD for authentication
if [ -z "${PGPASSWORD:-}" ]; then
  echo "Please set the PGPASSWORD environment variable with your database password." >&2
  exit 1
fi

echo "Running ${SQL_FILE} on ${DB_HOST}:${DB_PORT}/${DB_NAME} ..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"
echo "Database initialized."
