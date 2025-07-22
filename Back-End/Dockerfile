FROM node:18-alpine AS build-backend

# Alpine 3.21 n'a plus openssl1.1-compat, utiliser openssl3
RUN apk add --no-cache openssl

WORKDIR /Back-End

# Copier les fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste des fichiers
COPY . .

# Construire l'app
RUN npm run build

# ---- image d'exécution, plus légère ----
FROM node:18-alpine AS backend
RUN apk add --no-cache openssl
WORKDIR /Back-End

# Copier depuis l'étape de build
COPY --from=build-backend /Back-End/node_modules ./node_modules
COPY --from=build-backend /Back-End/.next ./.next
COPY --from=build-backend /Back-End/public ./public
COPY --from=build-backend /Back-End/package*.json ./
COPY --from=build-backend /Back-End/prisma ./prisma
COPY --from=build-backend /Back-End/next.config.js ./

EXPOSE 3001
CMD ["npm", "run", "start"]