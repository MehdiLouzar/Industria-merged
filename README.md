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

The frontend map now uses OpenStreetMap tiles, so no access token is required.

This starts PostgreSQL, the API backend on port 3001 and the front-end on port 3000.
The front-end is built with `NEXT_PUBLIC_API_URL=http://localhost:3001` so your
browser can reach the API directly on the host. When using Docker, the frontend
server accesses the backend via `API_INTERNAL_URL=http://backend:3001`.
An optional Nginx proxy listens on port 80.
The backend adds CORS headers in each API route so the React app can call the API
without extra configuration.

### Manual database initialisation

To execute the SQL script directly, run one of the helper commands inside
`Back-End/scripts`. The shell script falls back to Docker if the `psql` command
is not available:

```bash
cd Back-End
./scripts/run_initdb.sh
```

The script defaults to the `postgres` password if the `PGPASSWORD`
environment variable is not set.

Alternatively, a Node-based helper is provided and can be executed with `npm`:

```bash
cd Back-End
npm run db:init
```

When using `docker compose`, the script will execute `psql` inside the `db` service.
The SQL file now also creates demo users. Default logins are:

```
- admin@zonespro.ma / password123
- manager@zonespro.ma / password123
- demo@entreprise.ma / password123
```
Lambert polygon points are inserted into `zone_vertices` and `parcel_vertices`
to allow drawing shapes for zones and parcels.

Zones and parcels only store Lambert North Morocco coordinates (EPSG:26191).
Most API routes therefore return raw `lambertX` and `lambertY` values. The map
endpoints convert these coordinates to WGS84 before sending them to the browser
so Leaflet displays the correct locations.

You can also run the command manually:

```bash
PGPASSWORD=postgres docker compose exec db \
  psql -U postgres -d industria \
  -f /docker-entrypoint-initdb.d/initDB.sql
```
