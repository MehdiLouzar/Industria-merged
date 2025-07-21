# Industria Next.js App

This repository now uses a single Next.js project located in the `Front-End` directory. The previous Flask backend has been replaced with API routes built with Next.js and Prisma.

## Development

1. Install dependencies and generate the Prisma client:

```bash
cd Front-End
npm install
npm run db:generate
```

2. Start the development server:

```bash
npm run dev
```

API routes are available under `/api` and provide zone and parcel data used by the React components.

## Docker

A `docker-compose.yml` file is provided at the repository root. After installing Docker, you can build and run the project with:

```bash
docker compose up --build
```

This starts the Next.js application on port 3000 and an optional Nginx reverse proxy on port 80.
