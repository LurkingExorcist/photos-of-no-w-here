# Backend Service

> "The most profound technologies disappear. They weave themselves into the fabric of everyday life until they are indistinguishable from it."

A service operating in the background, processing the transient nature of digital memories.

## Core Functions

This backend handles:
- Extracting meaning from Instagram archives
- Analyzing the color essence of images
- Providing endpoints that manifest data on request
- Calculating relationships between visual elements
- Storing information with awareness of impermanence

## Primary Features

- **Archive Processing**: Convert personal data into universal form
- **Color Analysis**: Perceive the essential qualities of each image
- **Color-Based Retrieval**: Find photos by their fundamental properties
- **Efficient Caching**: Storage that acknowledges transience
- **API Documentation**: Clear pathways through complexity

## Documentation

API documentation is available at:
```
http://localhost:3333/api
```

## Endpoints

### Photo Retrieval

- `GET /photo/:color`
  - Retrieve a photo by its color value
  - Parameters:
    - `color`: Hex color value without # (e.g., "FF0000" for red)
  - Returns: Photo data
  - Error: 404 when no matching photo exists

### Data Processing

- `POST /data/upload`
  - Process Instagram archive
  - Content-Type: multipart/form-data
  - Parameters:
    - `archive`: ZIP file containing Instagram data
  - Returns: Processing result
  - Error: 400 if the file format is invalid

- `GET /data/media`
  - Retrieve media items with filtering
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
  - Returns: Cache metrics

- `POST /cache/verify`
  - Verify cache integrity
  - Returns: Verification result

- `POST /cache/clear`
  - Clear specified cache
  - Query Parameters:
    - `type`: Cache type to clear (optional)
      - `all`: Clear all caches
      - `color`: Clear color cache
      - `media`: Clear media cache
  - Returns: Operation result

- `GET /cache/slice`
  - Get a subset of cache entries
  - Query Parameters:
    - `type`: Cache type to query (required)
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

### Running

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

## Structure

```
src/
├── controllers/    # API endpoints
├── services/       # Core logic
├── interfaces/     # Type definitions
├── dto/            # Data transfer objects
└── main.ts         # Entry point
```
