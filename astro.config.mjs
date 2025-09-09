import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://BarthYer.github.io/EmbeddedTech', // ton URL GitHub Pages
  outDir: 'dist',
  integrations: [tailwind()],
  markdown: { syntaxHighlight: 'shiki' },
  vite: {
    build: {
      target: 'es2022'
    }
  }
});

