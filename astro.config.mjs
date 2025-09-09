import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://example.com',
  integrations: [tailwind()],
  markdown: { syntaxHighlight: 'shiki' },
  vite: { build: { target: 'es2022' } }
});
