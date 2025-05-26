# Photos of no-w-here

> "What we see exists only in relation to what we don't see."

A minimalist photo management platform where meaning emerges from absence.

## Vessel & Void

Photos of no-w-here organizes visual memories through the interplay of color and space. Images exist in relation to one another, their significance arising not from inherent properties but from interconnection.

The platform processes Instagram data archives, analyzes photos based on their colors, and places them in an infinite grid where meaning emerges from the spaces between.

## Architecture

A monorepo structure housing two complementary components:

- `frontend/`: A React application rendering an infinite photo grid with intuitive navigation
- `backend/`: A NestJS service processing Instagram archives and performing color analysis

## Prerequisites

- Node.js ≥ v18
- Docker & Docker Compose
- npm or yarn

## Getting Started

### Using Scripts

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

- `npm run dev` — Start development
- `npm run build` — Build for production
- `npm run start` — Run in production
- `npm run lint` — Analyze code
- `npm run lint:fix` — Fix code issues
- `npm run format` — Format codebase

### Containerization

Docker configurations:

- `docker-compose.yml` — Production environment
- `docker-compose.dev.yml` — Development environment

## API Documentation

After starting the containers, documentation is available at:
```
http://localhost:3333/api
```

## Core Concepts

- **Archive Processing**: Transform your Instagram data into insight
- **Color Analysis**: Reveal photos' fundamental qualities through color
- **Infinite Navigation**: Explore without boundaries
- **Relational Placement**: Photos positioned through their relationships
- **Dynamic Presence**: Images appear when needed, fade when not

## Technology

- **Frontend**: 
  - React + TypeScript
  - TailwindCSS
  - chroma-js

- **Backend**: 
  - NestJS + TypeScript
  - RESTful API design
  - Swagger documentation

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