import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (p) => fileURLToPath(new URL(p, import.meta.url));

// public/signals/ is the Temperature Comparison app, served as-is (classic scripts, no bundling).
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        origin: page('./index.html'),
        nomadcast: page('./nomadcast/index.html'),
      },
    },
  },
});
