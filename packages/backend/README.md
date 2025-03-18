# Backend Service

> "The best way to predict the future is to implement it."
> — Alan Kay

A NestJS service that processes and serves photos based on their color characteristics.

## Overview

The backend service handles:
- Instagram archive processing
- Color-based photo analysis
- RESTful API endpoints
- Swagger documentation

## API Documentation

Once the service is running, the Swagger documentation is available at:
```
http://localhost:3333/api
```

## Endpoints

### Photo Management

- `GET /photo/:color`
  - Retrieve a photo by its color
  - Parameters:
    - `color`: Hex color value without # (e.g., "FF0000" for red)
  - Returns: Photo file
  - Error: 404 if no photo matches the color

### Data Management

- `POST /data/upload`
  - Upload Instagram data archive
  - Content-Type: multipart/form-data
  - Parameters:
    - `archive`: ZIP file containing Instagram data
  - Returns: Processing result
  - Error: 400 if file is invalid or processing fails

- `GET /data/media`
  - Retrieve media items with filtering and pagination
  - Query Parameters:
    - `page`: Page number (1-based, default: 1)
    - `limit`: Items per page (default: 10)
    - `startDate`: Filter media created after this timestamp
    - `endDate`: Filter media created before this timestamp
    - `title`: Filter media by title (case-insensitive partial match)
    - `uri`: Filter media by URI (case-insensitive partial match)
  - Returns: Paginated response with media items
  ```json
  {
    "items": [...],
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
  ```

### Cache Management

- `GET /cache/stats`
  - Get current cache statistics
  - Returns: Cache statistics information

- `POST /cache/verify`
  - Verify and update the cache for all processed media items
  - Returns: Verification result

- `POST /cache/clear`
  - Clear the cache for specified type
  - Query Parameters:
    - `type`: Cache type to clear (optional)
      - `all`: Clear all caches
      - `color`: Clear color cache
      - `media`: Clear media cache
  - Returns: Clearing result

- `GET /cache/slice`
  - Get a slice of cache entries for a specific type
  - Query Parameters:
    - `type`: Cache type to get entries from (required)
      - `color`: Color cache entries
      - `media`: Media cache entries
    - `start`: Starting index (0-based, optional)
    - `count`: Number of entries to return (optional)
  - Returns: Array of cache entries

## Development

### Prerequisites

- Node.js ≥ v18
- npm or yarn

### Installation

```bash
npm install
```

### Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Watch mode
npm run start:watch
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── controllers/    # API endpoints
├── services/       # Business logic
├── interfaces/     # TypeScript interfaces
├── dto/           # Data transfer objects
└── main.ts        # Application entry point
```

## License

MIT License
