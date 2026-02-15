# Build stage
FROM node:22-slim AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN yarn install

COPY frontend/ .

RUN yarn build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy the config server script
COPY frontend/config-server.js .

EXPOSE 80

# Run the server on port 80
CMD ["node", "config-server.js"]
