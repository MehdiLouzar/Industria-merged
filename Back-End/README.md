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
