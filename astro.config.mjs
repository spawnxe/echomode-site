// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Deployed to GitHub Pages as a project site: https://spawnxe.github.io/echomode-site/
 *
 * When echomode.studio points at this repo:
 *   1. Settings → Pages → Custom domain → echomode.studio (GitHub writes public/CNAME; commit it)
 *   2. set SITE_URL=https://echomode.studio and SITE_BASE=/ in .github/workflows/deploy.yml
 */
const base = process.env.SITE_BASE ?? '/echomode-site';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://spawnxe.github.io',
  base,
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { assets: '_a' },
  devToolbar: { enabled: false },
});
