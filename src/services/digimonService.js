/**
 * DigiDex Web — servicio contra Digi-API (https://digi-api.com).
 * Gratis, sin API key, con CORS. Dataset de ~1488 Digimon con
 * niveles, atributos, tipos, fields, descripciones, skills y evoluciones.
 */
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

export function displayLevel(native) {
  return LEVEL_DISPLAY[native] ?? native ?? 'Unknown';
}

export function getLevelClass(display) {
  return LEVEL_CLASSES[display] ?? 'level-Unknown';
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Digi-API ${res.status}: ${url}`);
    return res.json();
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error(`Digi-API sin respuesta (15s): ${url}`);
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
  return {
    id: raw.id,
    name: raw.name,
    img: raw.images?.[0]?.href ?? '/favicon.svg',
    images: (raw.images ?? []).map((i) => i.href),
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
      name: s.skill,
      translation: s.translation ?? '',
      description: s.description ?? '',
    })),
    priorEvolutions: (raw.priorEvolutions ?? []).map((e) => ({
      id: e.id,
      name: e.digimon,
      img: e.image,
      condition: e.condition ?? '',
    })),
    nextEvolutions: (raw.nextEvolutions ?? []).map((e) => ({
      id: e.id,
      name: e.digimon,
      img: e.image,
      condition: e.condition ?? '',
    })),
  };
}

/** Ficha completa por id (usa caché del build cuando existe). */
export async function getDigimonById(id) {
  const cached = detailRawCache.get(Number(id) ?? id) ?? detailRawCache.get(id);
  const raw = cached ?? (await fetchWithTimeout(`${BASE_URL}/digimon/${id}`));
  return normalizeDetail(raw);
}

/** Ficha por nombre (búsqueda exacta insensible a mayúsculas). */
export async function getDigimonByName(name) {
  const data = await fetchWithTimeout(
    `${BASE_URL}/digimon?name=${encodeURIComponent(name)}&pageSize=20`,
  );
  const items = data?.content ?? [];
  const exact = items.find((i) => i.name.toLowerCase() === String(name).toLowerCase()) ?? items[0];
  if (!exact) return null;
  return getDigimonById(exact.id);
}

/** Recorre la lista paginada (`pageSize` alto = pocas peticiones). */
async function fetchAllList(pageSize = 200) {
  const out = [];
  let page = 0;
  for (;;) {
    const data = await fetchWithTimeout(`${BASE_URL}/digimon?page=${page}&pageSize=${pageSize}`);
    const items = data?.content ?? [];
    out.push(...items);
    const pageable = data?.pageable;
    if (!pageable?.nextPage || items.length === 0) break;
    page += 1;
  }
  return out;
}

/** Pool simple para limitar concurrencia en el build. */
async function pool(items, size, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = await fn(items[idx], idx);
      } catch {
        results[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
}

let catalogCache = null;
/** Detalles crudos por id (se llena durante getCatalog; evita refetch en [name].astro). */
export const detailRawCache = new Map();

/**
 * Catálogo ligero para el índice: [{ id, name, img, level, nativeLevel, attributes }].
 * Se cachea en memoria para reutilizar entre páginas durante el build.
 */
export async function getCatalog() {
  if (catalogCache) return catalogCache;
  const list = await fetchAllList();
  const details = await pool(list, 25, (item) => fetchWithTimeout(`${BASE_URL}/digimon/${item.id}`));
  for (const raw of details) {
    if (raw?.id != null) detailRawCache.set(raw.id, raw);
  }
  catalogCache = details
    .filter(Boolean)
    .map((raw) => {
      const d = normalizeDetail(raw);
      return {
        id: d.id,
        name: d.name,
        img: d.img,
        level: d.level,
        nativeLevel: d.nativeLevel,
        attributes: d.attributes,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return catalogCache;
}

/** Detalle completo (usa el catálogo cacheado cuando puede). */
export async function getDetailByName(name) {
  const catalog = await getCatalog().catch(() => null);
  const hit = catalog?.find((c) => c.name.toLowerCase() === String(name).toLowerCase());
  if (hit) return getDigimonById(hit.id);
  return getDigimonByName(name);
}
