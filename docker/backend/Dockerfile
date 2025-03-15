FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/backend ./packages/backend

# Build the application
RUN npm run build -w @photos-of-no-w-here/backend

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/backend/package*.json ./packages/backend/

RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3333/health || exit 1

EXPOSE 3333

CMD ["node", "packages/backend/dist/src/main"] 