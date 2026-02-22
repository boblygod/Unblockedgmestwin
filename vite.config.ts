import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
