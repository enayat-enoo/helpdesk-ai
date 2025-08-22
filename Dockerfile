# ======================
# Stage 1: Build client
# ======================
FROM node:20 AS client-build

WORKDIR /client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build


# ======================
# Stage 2: Build server
# ======================
FROM node:20 AS server-build

WORKDIR /server

COPY server/package*.json ./
RUN npm install --production

COPY server/ ./


# ======================
# Stage 3: Final runtime
# ======================
FROM node:20

WORKDIR /app

# Copy server build
COPY --from=server-build /server /app

# Copy client build into server's public folder
COPY --from=client-build /client/dist /app/public

# Install a simple static middleware if not already
RUN npm install serve-static

EXPOSE 8080

CMD ["npm", "start"]
