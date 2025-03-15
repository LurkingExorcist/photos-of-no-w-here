FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/config/package*.json ./packages/config/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/backend ./packages/backend
COPY packages/config ./packages/config

# Build the application
RUN npm run build -w @photos-of-no-w-here/backend

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/backend/package*.json ./packages/backend/
COPY --from=builder /app/packages/config/package*.json ./packages/config/

RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/config/dist ./packages/config/dist

EXPOSE 3333

CMD ["node", "packages/backend/dist/src/main"] 