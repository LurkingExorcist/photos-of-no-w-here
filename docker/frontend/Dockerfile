FROM node:20-alpine AS builder

WORKDIR /app/packages/frontend

# Copy package files
COPY packages/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY packages/frontend ./

# For development, we'll stop at the builder stage and run the dev server
# For production, we'll build the app and use a minimal nginx image