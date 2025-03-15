import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    server: {
        port: 1111,
        host: true,  // Needed for Docker
        proxy: {
            '/api': {
                target: 'http://backend:3333',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    preview: {
        port: 1111,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [react()],
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
    },
});
