# Multi-stage build for Next.js with Bun
FROM oven/bun:1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN bun run build

# List contents to debug
RUN ls -la /app/

# Production image with Node.js for serving static files
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install serve for static file serving
RUN npm install -g serve

# Copy the built application (static export creates 'out' directory)
COPY --from=builder /app/out ./out

# Set the correct permission for the app directory
RUN chown -R nextjs:nodejs /app

# Switch to nextjs user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Serve the static files since this is an exported app
CMD ["serve", "out", "-p", "3000", "-s"]