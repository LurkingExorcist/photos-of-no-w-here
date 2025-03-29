# Photos of no-w-here

> "In photography, there is a reality so subtle that it becomes more real than reality." 
> — Alfred Stieglitz

A minimalist photo management platform built with modern TypeScript. Where pixels meet poetry.

## Project Overview

Photos of no-w-here is a specialized photo management platform that organizes and displays photos based on their color characteristics. The platform processes Instagram data archives, analyzes photos based on their colors, and provides an intuitive, infinite grid interface for exploring your visual memories through the lens of color similarity.

## Architecture

A monorepo structure housing two main components:

- `frontend/`: A React application that renders an infinite, color-based photo grid with panning, zooming, and smart photo placement based on color similarity.
- `backend/`: A NestJS service that processes Instagram archives, performs color-based photo analysis, and serves photos through a RESTful API.

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

## API Documentation

After starting the containers, the Swagger documentation is available at:
```
http://localhost:3333/api
```

## Key Features

- **Instagram Archive Processing**: Upload and process your Instagram data exports
- **Color-Based Photo Analysis**: Photos are analyzed for their color characteristics
- **Infinite Pan and Zoom**: Navigate through your photo collection with intuitive controls
- **Color-Based Placement**: Similar colors are positioned closer together in the grid
- **Dynamic Loading**: Photos load as you explore, with color placeholders shown during loading

## Tech Stack

- **Frontend**: 
  - React + TypeScript
  - TailwindCSS
  - chroma-js for color manipulation

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

## License

MIT License