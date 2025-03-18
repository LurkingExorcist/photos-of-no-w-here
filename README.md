# Photos of no-w-here

> "In photography, there is a reality so subtle that it becomes more real than reality." 
> — Alfred Stieglitz

A minimalist photo management platform built with modern TypeScript. Where pixels meet poetry.

## Architecture

A monorepo structure housing three distinct components:

- `frontend/`: A React application that renders your visual memories
- `backend/`: A NestJS service orchestrating the digital darkroom
- `frontend_old/`: Legacy implementation (archived)

## Requirements

- Node.js ≥ v18
- Docker & Docker Compose
- npm or yarn

## Quick Start

### Using Scripts

The project provides convenient scripts for both development and production environments:

```bash
# Development environment
./scripts/start-dev.sh

# Production environment
./scripts/start-prod.sh
```

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/photos-of-no-w-here.git
cd photos-of-no-w-here

# Install dependencies
npm install

# Start development servers
npm run dev
```

## Development

### Available Commands

- `npm run dev` — Start development environment
- `npm run build` — Build for production
- `npm run start` — Run in production mode
- `npm run lint` — Static code analysis
- `npm run lint:fix` — Auto-fix linting issues
- `npm run format` — Format codebase

### Containerization

Docker configurations are available for both environments:

- `docker-compose.yml` — Production environment
- `docker-compose.dev.yml` — Development environment


After starting the containers, the Swagger documentation is available at:
```
http://localhost:3333/api
```

## API Endpoints

### Photo Management

- `POST /data/upload` — Upload Instagram archive
  - Accepts ZIP archive containing Instagram data
  - Processes and stores photos for color-based retrieval

- `GET /photo/:color` — Retrieve photos by color
  - Returns photos matching the specified color
  - Supports only hex color format without #

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: NestJS + TypeScript
- **Development**:
  - TypeScript
  - ESLint
  - Prettier
  - Docker

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: your feature description'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License