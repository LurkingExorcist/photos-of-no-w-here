import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: '/',
    server: {
        port: 1111,
        host: '0.0.0.0', // Required for Docker
        strictPort: true, // Ensure Vite doesn't try alternative ports
        proxy: {
            '/api': {
                target: 'http://backend:3333',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    preview: {
        port: 1111,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [...react()],
});
