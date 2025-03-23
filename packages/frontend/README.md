# Infinite Photo Grid

A React application that implements an infinite, color-based photo grid with panning, zooming, and smart photo placement based on color similarity.

## Features

- **Infinite Pan and Zoom**: Smoothly navigate through the grid with intuitive panning and zooming.
- **Color-Based Photo Placement**: Photos are positioned in the grid based on their color similarity.
- **Dynamic Loading**: Photos are lazily loaded as they're needed, with color placeholders shown during loading.
- **Multiple Color Metrics**: Choose between RGB (Euclidean distance) and Lab (Delta E) color similarity metrics.
- **Integration with Backend**: Works seamlessly with the backend service to retrieve photos by color.
- **Responsive Design**: Adapts to different screen sizes and device types.
- **Visual Clustering**: Similar colors are visually clustered together, creating natural gradients across the grid.

## Technologies Used

- React with TypeScript
- TailwindCSS for styling
- @use-gesture/react for gesture handling
- chroma-js for color manipulation
- Modern React hooks for state management

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd packages/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the App

```bash
npm run dev
```

This will start the development server. Open your browser and navigate to the URL displayed in the terminal (usually http://localhost:5173).

## Usage

- **Pan**: Click and drag to move around the grid
- **Zoom**: Use mouse wheel or pinch gesture to zoom in and out
- **Settings**: Use the settings panel in the top-right corner to change the color similarity metric
- **Add Photos**: Click the "Add More Photos" button to generate additional random photos

## How It Works

The application uses a force-directed layout algorithm to position photos based on their color similarity. Similar colors are positioned closer together, creating a natural gradient effect across the grid.

When a photo hasn't been loaded yet, a placeholder with the photo's average color is displayed. Photos are fetched from a simulated API that associates photos with specific colors.

## License

MIT
