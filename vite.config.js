import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: true,
    sourcemap: true,
  },
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    cors: true
  }
}); 