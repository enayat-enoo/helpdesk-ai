# ======================
# Stage 2: Build server
# ======================
FROM node:20-slim AS server-build

WORKDIR /server

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ ./
