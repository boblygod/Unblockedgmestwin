import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
