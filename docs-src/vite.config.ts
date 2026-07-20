import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Builds the GitHub Pages documentation/demo site into ../docs so it can be
// served directly from the repo (Settings -> Pages -> branch: main, folder: /docs).
export default defineConfig({
  root: __dirname,
  base: '/latex-cite-editor/',
  plugins: [react()],
  resolve: {
    alias: {
      // Examples import the public package name; point it at the library
      // source so the demo site always reflects the current code.
      'latex-cite-editor/react': path.resolve(__dirname, '../src/react.ts'),
      'latex-cite-editor': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../docs'),
    emptyOutDir: true,
  },
});
