# Next.js API Backend

This directory contains the Next.js backend exposing API routes for the industrial zones application.

## Development

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed  # optional
npm run dev
```

The server listens on port 3001 by default and connects to PostgreSQL using `DATABASE_URL`.

## Populate the database with initDB.sql

A helper script is provided to run the SQL file located in `db/init/initDB.sql`.
Make sure the `psql` command is available and set the `PGPASSWORD` environment
variable with your database password. Other connection parameters can be
customised via `DB_HOST`, `DB_PORT`, `DB_USER` and `DB_NAME`.

```bash
export PGPASSWORD=postgres
./scripts/run_initdb.sh
```
