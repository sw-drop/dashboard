import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});
// Note: This integrates Tailwind CSS v4 directly into the Vite build pipeline
// with no external tailwind.config.js file required!
