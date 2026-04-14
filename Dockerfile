# Build stage
FROM node:22-slim AS builder

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/yarn.lock ./
COPY frontend/.yarnrc.yml ./

RUN corepack enable
RUN yarn install --frozen-lockfile

COPY frontend/ .

ARG API_URL
ENV API_URL=${API_URL}

RUN yarn build

# Production stage
FROM node:22-slim

WORKDIR /app

# Статика Angular + минимальный Node-сервер (см. server.js)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
# server.js при старте вызывает requireApiUrl() из scripts/load-env.js и перезаписывает dist/.../config.js из API_URL
COPY --from=builder /app/scripts ./scripts

EXPOSE 80

# Задайте API_URL при запуске (или build-arg на этапе сборки), иначе подставится значение из src/config.js на момент yarn build.
# PORT подставляет платформа (например 8080); server.js читает process.env.PORT
CMD ["node", "server.js"]
