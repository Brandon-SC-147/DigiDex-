import { defineMiddleware } from 'astro:middleware';

/**
 * Hardening de cabeceras para respuestas SSR (van por el Worker + middleware).
 * NOTA: las rutas prerenderizadas (/, /dex, /generaciones/*, /404) se sirven
 * como estáticas según _routes.json y NO pasan por el middleware; no reflejan
 * input no confiable en servidor (el escape vive en cliente/servicio), por lo
 * que el riesgo XSS reside en las fichas dinámicas, cubiertas aquí.
 * Si se requiere cobertura total, aplicarlas en la capa de despliegue
 * (Cloudflare Transform Rules) en lugar de romper el prerender.
 * NOTA CSP: no se envía Content-Security-Policy porque el proyecto usa scripts
 * inline (hidratación JSON-LD), Google Fonts y imágenes de digi-api.com; una CSP
 * estricta exigiría 'unsafe-inline' y daría falsa seguridad. Reevaluar si se
 * eliminan los inline scripts.
 */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(name)) response.headers.set(name, value);
  }
  return response;
});
