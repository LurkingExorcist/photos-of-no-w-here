FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/config/package*.json ./packages/config/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/frontend ./packages/frontend
COPY packages/config ./packages/config

# Build the application
RUN npm run build -w @photos-of-no-w-here/frontend

# Production stage
FROM nginx:alpine

# Copy the built assets from builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 