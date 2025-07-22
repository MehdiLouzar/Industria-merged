FROM node:18-alpine AS build-backend

# OpenSSL 1.1 indispensable à Prisma
RUN apk add --no-cache openssl1.1-compat

WORKDIR /Back-End

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Construire l’app si nécessaire
RUN npm run build       # retire si pas de step build côté back

# ---- image d’exécution, plus légère ----
FROM node:18-alpine AS backend
RUN apk add --no-cache openssl1.1-compat
WORKDIR /Back-End
COPY --from=build-backend /Back-End .
EXPOSE 3001
CMD ["npm", "run", "start"]
