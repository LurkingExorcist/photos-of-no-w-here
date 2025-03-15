import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    base: '/',
    server: {
        port: 1111,
        host: '0.0.0.0',  // Required for Docker
        strictPort: true, // Ensure Vite doesn't try alternative ports
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
})
