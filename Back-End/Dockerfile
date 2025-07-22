# Back-End/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start"]