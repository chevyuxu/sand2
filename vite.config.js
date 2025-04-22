import { defineConfig } from 'vite';

export default defineConfig({
  base: '/sand2/', // 添加這行，設置基礎路徑為倉庫名
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
