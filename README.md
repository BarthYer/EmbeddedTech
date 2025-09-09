# EmbeddedTech — Astro (GitHub Pages)

Structure: hero, derniers articles (cartes), newsletter, catégories populaires, footer riche.
Fonctionnalités: Markdown + highlight, recherche Pagefind, RSS, sombre/clair, responsive.

## Local
npm i
npm run dev

## Build avec recherche
npm run build:with-search

## GitHub Pages
- Remplace `site` (et éventuellement `base`) dans `astro.config.mjs`:
```js
export default defineConfig({
  site: 'https://USER.github.io/REPO/',
  base: '/REPO',
  integrations: [tailwind()],
});
```
- Active Pages (source GitHub Actions). Le workflow `deploy.yml` build + déploie.
