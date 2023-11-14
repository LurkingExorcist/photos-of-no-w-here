import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/photos-of-no-w-here/',
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  plugins: [react()],
})
