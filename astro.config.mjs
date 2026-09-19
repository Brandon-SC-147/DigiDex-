import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://docs.astro.build/en/reference/configuration-reference/
// Estático + adapter Cloudflare = híbrido: las páginas se prerenderizan salvo
// `export const prerender = false` (/dex/[slug] es SSR bajo demanda).
// El deploy debe publicar la salida del adaptador (Worker), no solo `dist/` estático.
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://digidex.22101808.workers.dev',
  server: {
    port: 4321,
    host: true,
  },
});
