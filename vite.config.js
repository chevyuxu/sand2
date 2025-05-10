import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // 從 /sand2/ (或任何其他非 / 的值) 修改為 /
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
