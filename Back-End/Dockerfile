FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start"]
