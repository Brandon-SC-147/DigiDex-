/**
 * DigiDex Web — servicio contra Digi-API (https://digi-api.com).
 * Gratis, sin API key, con CORS. Dataset de ~1488 Digimon con
 * niveles, atributos, tipos, fields, descripciones, skills y evoluciones.
 */
import { normalizeId, safeImageUrl, isAllowedImageUrl } from '../utils/security.js';

const BASE_URL = 'https://digi-api.com/api/v1';
const TIMEOUT_MS = 15000;

/** Niveles nativos de Digi-API -> nombre clásico para mostrar. */
export const LEVEL_DISPLAY = {
  'Baby I': 'Fresh',
  'Baby II': 'In Training',
  Child: 'Rookie',
  Adult: 'Champion',
  Perfect: 'Ultimate',
  Ultimate: 'Mega',
  Armor: 'Armor',
  Hybrid: 'Hybrid',
  Unknown: 'Unknown',
};

export const LEVEL_CLASSES = {
  Fresh: 'level-Fresh',
  'In Training': 'level-InTraining',
  Rookie: 'level-Rookie',
  Champion: 'level-Champion',
  Ultimate: 'level-Ultimate',
  Mega: 'level-Mega',
  Armor: 'level-Armor',
  Hybrid: 'level-Hybrid',
  Unknown: 'level-Unknown',
};

export const LEVEL_ORDER = [
  'Fresh',
  'In Training',
  'Rookie',
  'Champion',
  'Ultimate',
  'Mega',
  'Armor',
  'Hybrid',
  'Unknown',
];

/** Taxonomías nativas de Digi-API (referencia estable, verificada contra /level y /attribute). */
export const NATIVE_LEVELS = [
  'Baby I',
  'Baby II',
  'Child',
  'Adult',
  'Perfect',
  'Ultimate',
  'Armor',
  'Hybrid',
  'Unknown',
];
export const NATIVE_ATTRIBUTES = [
  'Data',
  'Vaccine',
  'Virus',
  'Free',
  'Variable',
  'Unknown',
  'No Data',
];

export function displayLevel(native) {
  return LEVEL_DISPLAY[native] ?? native ?? 'Unknown';
}

export function getLevelClass(display) {
  return LEVEL_CLASSES[display] ?? 'level-Unknown';
}

export async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Digi-API ${res.status}: ${url}`);
    return res.json();
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error(`Digi-API sin respuesta (${timeoutMs / 1000}s): ${url}`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function primaryLevel(levels) {
  if (Array.isArray(levels) && levels.length > 0) return levels[0].level ?? 'Unknown';
  return 'Unknown';
}

function englishDescription(descriptions) {
  if (!Array.isArray(descriptions) || descriptions.length === 0) return '';
  return (
    descriptions.find((d) => d.language === 'en_us')?.description ??
    descriptions.find((d) => d.language === 'en')?.description ??
    descriptions[0].description ??
    ''
  );
}

/** Normaliza el detalle crudo de Digi-API al modelo de la app. */
export function normalizeDetail(raw) {
  const native = primaryLevel(raw.levels);
  const toEvo = (e) => ({
    id: normalizeId(e.id),
    name: e.digimon,
    img: safeImageUrl(e.image),
    condition: e.condition ?? '',
  });
  return {
    id: normalizeId(raw.id),
    name: raw.name,
    img: safeImageUrl(raw.images?.[0]?.href),
    images: (raw.images ?? []).map((i) => i.href).filter((u) => isAllowedImageUrl(u)),
    nativeLevel: native,
    level: displayLevel(native),
    levels: (raw.levels ?? []).map((l) => ({ native: l.level, display: displayLevel(l.level) })),
    types: (raw.types ?? []).map((t) => t.type),
    attributes: (raw.attributes ?? []).map((a) => a.attribute),
    fields: (raw.fields ?? []).map((f) => ({ name: f.field, image: f.image })),
    releaseDate: raw.releaseDate ?? '',
    xAntibody: Boolean(raw.xAntibody),
    description: englishDescription(raw.descriptions),
    skills: (raw.skills ?? []).map((s) => ({
      id: s.id,
      name: s.skill,
      translation: s.translation ?? '',
      description: s.description ?? '',
    })),
    priorEvolutions: (raw.priorEvolutions ?? []).map(toEvo).filter((e) => e.id !== null),
    nextEvolutions: (raw.nextEvolutions ?? []).map(toEvo).filter((e) => e.id !== null),
  };
}

/** Ficha completa por id (usa caché en memoria cuando existe). */
export async function getDigimonById(id) {
  const validId = normalizeId(id);
  if (validId === null) throw new Error(`ID de Digimon inválido: ${String(id)}`);
  const cached = detailRawCache.get(validId);
  if (cached) return normalizeDetail(cached);
  const raw = await fetchWithTimeout(`${BASE_URL}/digimon/${validId}`);
  if (raw?.id != null) detailRawCache.set(raw.id, raw);
  return normalizeDetail(raw);
}

/** Ficha por nombre (búsqueda exacta insensible a mayúsculas). */
export async function getDigimonByName(name) {
  const hit = await resolveLegacySlug(name);
  if (!hit) return null;
  return getDigimonById(hit.id);
}

/** Resuelve un nombre heredado a { id, name } con 1 sola petición (sin detalle). */
export async function resolveLegacySlug(name) {
  const data = await fetchWithTimeout(
    `${BASE_URL}/digimon?name=${encodeURIComponent(name)}&pageSize=20`,
  );
  const items = data?.content ?? [];
  const exact =
    items.find((i) => String(i.name).toLowerCase() === String(name).toLowerCase()) ?? items[0];
  if (!exact) return null;
  const id = normalizeId(exact.id);
  if (id === null) return null;
  return { id, name: exact.name };
}

/** Detalles crudos por id (caché en memoria: build y sesión del navegador). */
export const detailRawCache = new Map();

/** Slug descriptivo para URLs estables `/dex/123-nombre`. */
export function slugify(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** URL estable de ficha: el ID identifica, el slug solo describe (SEO). */
export function detailHref(d) {
  const id = normalizeId(d?.id);
  if (id === null) return '/dex';
  return `/dex/${id}-${slugify(d.name)}`;
}

/** Extrae el ID de un slug `/dex/123-nombre`; null si es formato heredado. */
export function parseSlugId(slug) {
  const m = String(slug ?? '').match(/^(\d+)(?:-|$)/);
  return m ? Number(m[1]) : null;
}

/** Ficha ligera para tarjetas del catálogo. */
function toCard(detail) {
  return {
    id: detail.id,
    name: detail.name,
    img: detail.img,
    level: detail.level,
    nativeLevel: detail.nativeLevel,
    attributes: detail.attributes,
    href: detailHref(detail),
  };
}

/**
 * Página real del servidor Digi-API.
 * `page` es base 0 (la UI muestra base 1). Devuelve totales reales, sin hardcodear.
 * @returns {Promise<{ items, currentPage, totalPages, totalElements, pageSize }>}
 */
export async function getDigimonPage({
  page = 0,
  pageSize = 24,
  name = '',
  level = '',
  attribute = '',
  xAntibody = '',
} = {}) {
  const q = new URLSearchParams();
  q.set('page', String(Math.max(0, page)));
  q.set('pageSize', String(pageSize));
  if (name.trim()) q.set('name', name.trim());
  if (level) q.set('level', level);
  if (attribute) q.set('attribute', attribute);
  if (xAntibody === true || xAntibody === 'true') q.set('xAntibody', 'true');
  else if (xAntibody === false || xAntibody === 'false') q.set('xAntibody', 'false');

  const data = await fetchWithTimeout(`${BASE_URL}/digimon?${q}`);
  const list = data?.content ?? [];
  const pageable = data?.pageable ?? {};
  const details = await Promise.all(
    list.map((item) =>
      getDigimonById(item.id).catch(() => ({
        id: normalizeId(item.id),
        name: item.name,
        img: safeImageUrl(item.image),
        level: 'Unknown',
        attributes: [],
      })),
    ),
  );
  return {
    items: details.map(toCard),
    currentPage: pageable.currentPage ?? Math.max(0, page),
    totalPages: pageable.totalPages ?? 1,
    totalElements: pageable.totalElements ?? details.length,
    pageSize,
  };
}

/** Total de registros según Digi-API (1 petición ligera, sin descargar nada). */
export async function getTotalCount() {
  const data = await fetchWithTimeout(`${BASE_URL}/digimon?page=0&pageSize=1`);
  return data?.pageable?.totalElements ?? 0;
}

const levelListCache = new Map();

/** Tarjetas del mismo nivel nativo (para "relacionados" en la ficha). */
export async function getSameLevel(nativeLevel, excludeId, limit = 6) {
  if (!levelListCache.has(nativeLevel)) {
    const data = await fetchWithTimeout(
      `${BASE_URL}/digimon?level=${encodeURIComponent(nativeLevel)}&page=0&pageSize=${limit + 1}`,
    );
    levelListCache.set(nativeLevel, data?.content ?? []);
  }
  return (levelListCache.get(nativeLevel) ?? [])
    .filter((i) => i.id !== excludeId)
    .slice(0, limit)
    .map((i) => ({
      id: normalizeId(i.id),
      name: i.name,
      img: safeImageUrl(i.image),
      level: displayLevel(nativeLevel),
      nativeLevel,
      attributes: [],
      href: `/dex/${normalizeId(i.id)}-${slugify(i.name)}`,
    }));
}
