# Industria React Front‑end & Next.js API

The project is now split into two folders:

- `Front-End` – React application built with Next.js (static export)
- `Back-End` – Next.js server exposing the API and Prisma database

## Development

1. Install dependencies:

```bash
cd Front-End && npm install
cd ../Back-End && npm install
```

2. Generate the Prisma client and seed data (optional):

```bash
npm run db:generate
npm run db:push       # creates tables in PostgreSQL
npm run db:seed       # optional demo data
```

3. Start both apps during development (in separate terminals):

```bash
npm run dev       # from Front-End
npm run dev       # from Back-End
```

API routes are available under `/api` and provide zone and parcel data used by the React components.

## Docker

A `docker-compose.yml` file is provided at the repository root. After installing Docker, you can build and run the project with:

```bash
docker compose up --build
```

This starts PostgreSQL, the API backend on port 3001 and the front-end on port 3000. An optional Nginx proxy listens on port 80.
