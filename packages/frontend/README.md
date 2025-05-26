# Infinite Photo Grid

> "The space between things often reveals more than the things themselves."

A reactive interface where photos exist in relation to one another, positioned in an infinite space without predefined boundaries.

## Core Features

- **Fluid Navigation**: Move through the grid with intuitive gestures
- **Color Relationships**: Photos positioned based on visual similarities
- **Dynamic Loading**: Images appear when needed, remain absent when not
- **Multiple Metrics**: Choose how color relationships are measured
- **Seamless Integration**: Connected with the backend, yet functionally independent
- **Responsive Design**: Adapts to different viewing contexts
- **Visual Continuity**: Similar colors naturally flow together

## Technology

- React with TypeScript
- TailwindCSS for styling
- chroma-js for color analysis
- Modern hooks for state management

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd packages/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the Application

```bash
npm run dev
```

Open your browser to the URL displayed in the terminal (typically http://localhost:5173).

## Interaction

- **Pan**: Click and drag to move through the space
- **Zoom**: Use mouse wheel or pinch gesture to change perspective
- **Settings**: Adjust parameters via the settings panel
- **Add Photos**: Introduce new elements through the "Add More Photos" action

## Technical Approach

The application arranges photos using a force-directed algorithm that respects color relationships. Similar hues naturally position near one another, creating gradual transitions across the grid.

When an image hasn't loaded, its essence—represented by its average color—holds its place. The grid maintains visual coherence even as content transitions between states of presence and absence.
