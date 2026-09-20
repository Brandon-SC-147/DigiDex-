/**
 * DigiDex — utilidades de seguridad en la frontera de render/API.
 * Unifica escape HTML, serialización JSON segura, validación de IDs
 * e imágenes. Sin dependencias; apto para SSR y cliente.
 */

/** Escape HTML completo: & < > " '. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Serializa JSON para incrustar en <script type="application/json">.
 * JSON.stringify solo NO neutraliza `</script>`: se escapan < > &
 * y los separadores U+2028/U+2029 (válidos en JS pero no en JSON).
 */
export function safeJsonForHtml(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Normaliza un ID de Digi-API: número finito o null.
 * Todo ID que llegue a hrefs/atributos pasa por aquí.
 */
export function normalizeId(value) {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : null;
}

/** Hosts de imagen permitidos (Digi-API) + recursos locales. */
const ALLOWED_IMAGE_HOSTS = new Set(['digi-api.com']);

export function isAllowedImageUrl(url) {
  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) return false;
  if (url.startsWith('/')) return !url.startsWith('//');
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  for (const allowed of ALLOWED_IMAGE_HOSTS) {
    if (host === allowed || host.endsWith(`.${allowed}`)) return true;
  }
  return false;
}

/** URL de imagen validada o fallback local existente. */
export function safeImageUrl(url, fallback = '/favicon.svg') {
  return isAllowedImageUrl(url) ? url : fallback;
}
