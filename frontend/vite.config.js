import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Needed for Docker container port mapping
    watch: {
      usePolling: true // Needed for hot reloading to work reliably inside Docker containers on some OS hosts
    }
  }
});
