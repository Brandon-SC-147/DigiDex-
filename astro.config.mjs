import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  output: 'static',
  site: 'https://digidex.22101808.workers.dev',
  server: {
    port: 4321,
    host: true,
  },
});
