# Frontend Service

> "Design is not just what it looks like and feels like. Design is how it works."
> — Steve Jobs

A React application for exploring photos through color-based navigation.

## Overview

The frontend service provides:
- Color-based photo exploration
- Instagram archive upload interface
- Responsive design
- Modern React with TypeScript

## Features

- **Color Navigation**: Browse photos by selecting specific colors
- **Archive Upload**: Upload and process Instagram data archives
- **Media Gallery**: View and filter processed media items
- **Cache Management**: Monitor and manage photo cache

## Development

### Prerequisites

- Node.js ≥ v18
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # React components
├── styles/        # CSS and style files
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Environment Variables

The application expects the following environment variables:

- `VITE_API_URL`: Backend API URL (default: http://localhost:3333)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
