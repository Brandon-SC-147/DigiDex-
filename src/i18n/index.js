/**
 * DigiDex i18n — capa centralizada ES/EN.
 * - `t(lang, 'seccion.clave', vars)`: texto de interfaz.
 * - `localizeLevel/Attr/Type/Field`: presentación visual de valores Digi-API
 *   (el valor original NUNCA se altera en filtros, URLs ni comparaciones).
 * - Los datos dinámicos sin traducción ES muestran el original en inglés.
 */
import { es } from './es.js';
import { en } from './en.js';

export const LANG_KEY = 'digidex-lang';
export const LANGS = ['es', 'en'];
export const DEFAULT_LANG = 'es';

const DICTS = { es, en };

export function normalizeLang(value) {
  return value === 'en' ? 'en' : 'es';
}

export function t(lang, key, vars = {}) {
  const dict = DICTS[normalizeLang(lang)] ?? es;
  const parts = String(key).split('.');
  let node = dict;
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) node = node[p];
    else return key;
  }
  if (typeof node !== 'string') return key;
  return node.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Nivel Digi-API (nativo o clásico) -> etiqueta visual. */
const LEVEL_ES = {
  'Baby I': 'Bebé I',
  'Baby II': 'Bebé II',
  Fresh: 'Bebé',
  'In Training': 'En entrenamiento',
  Training: 'En entrenamiento',
  Child: 'Novato',
  Rookie: 'Novato',
  Adult: 'Campeón',
  Champion: 'Campeón',
  Perfect: 'Ultra',
  Ultimate: 'Ultra',
  Mega: 'Mega',
  Armor: 'Armadura',
  Hybrid: 'Híbrido',
  Unknown: 'Desconocido',
};

export function localizeLevel(value, lang) {
  if (normalizeLang(lang) === 'en') return value ?? 'Unknown';
  return LEVEL_ES[value] ?? value ?? 'Desconocido';
}

const ATTR_ES = {
  Vaccine: 'Vacuna',
  Data: 'Datos',
  Virus: 'Virus',
  Free: 'Libre',
  Variable: 'Variable',
  Unknown: 'Desconocido',
  'No Data': 'Sin datos',
};

export function localizeAttr(value, lang) {
  if (normalizeLang(lang) === 'en') return value ?? 'Unknown';
  return ATTR_ES[value] ?? value ?? 'Desconocido';
}

/** Tipos con equivalencia razonable; si no hay, se muestra el original. */
const TYPE_ES = {
  Reptile: 'Reptil',
  Mammal: 'Mamífero',
  Dragon: 'Dragón',
  Bird: 'Ave',
  Beast: 'Bestia',
  Insect: 'Insecto',
  Aquatic: 'Acuático',
  Plant: 'Planta',
  Machine: 'Máquina',
  Holy: 'Sagrado',
  Demon: 'Demonio',
  Warrior: 'Guerrero',
  Fairy: 'Hada',
  Ghost: 'Fantasma',
  Rock: 'Roca',
  Fire: 'Fuego',
  Ice: 'Hielo',
  Electric: 'Eléctrico',
  Dark: 'Oscuro',
  Light: 'Luz',
  Birdman: 'Hombre ave',
  Cyborg: 'Cíborg',
  Mutant: 'Mutante',
  Undead: 'No muerto',
  Ancient: 'Antiguo',
};

export function localizeType(value, lang) {
  if (normalizeLang(lang) === 'en') return value ?? '';
  return TYPE_ES[value] ?? value ?? '';
}

/** Fields: se conserva el nombre oficial (sin terminología inventada). */
export function localizeField(value) {
  return value ?? '';
}

/**
 * Descripción dinámica: EN muestra el original; ES muestra traducción si
 * existe y si no, el original con aviso discreto (`translated: false`).
 */
export function localizeDescription(detail, lang, translations = {}) {
  const original = detail?.description || '';
  if (normalizeLang(lang) === 'en') return { text: original, translated: true };
  const translated = translations[detail?.id];
  if (translated) return { text: translated, translated: true };
  return { text: original, translated: false };
}

// ---------- Cliente (solo navegador) ----------

export function getStoredLang() {
  try {
    return normalizeLang(localStorage.getItem(LANG_KEY));
  } catch {
    return DEFAULT_LANG;
  }
}

export function currentLang() {
  if (typeof document !== 'undefined' && document.documentElement.lang === 'en') return 'en';
  return getStoredLang();
}

function swapStatic(root, lang) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const text = t(lang, el.getAttribute('data-i18n'));
    if (text) el.textContent = text;
  });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.setAttribute('placeholder', t(lang, el.getAttribute('data-i18n-ph')));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(lang, el.getAttribute('data-i18n-aria')));
  });
  // Badges de nivel con valor nativo en `data-level`.
  root.querySelectorAll('[data-level]').forEach((el) => {
    el.textContent = localizeLevel(el.getAttribute('data-level'), lang);
  });
}

function paintSwitcher(lang) {
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    const active = btn.getAttribute('data-lang-btn') === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

export function applyLanguage(lang) {
  const clean = normalizeLang(lang);
  document.documentElement.lang = clean;
  swapStatic(document, clean);
  paintSwitcher(clean);
  window.dispatchEvent(new CustomEvent('digidex:lang', { detail: { lang: clean } }));
}

export function setLanguage(lang) {
  const clean = normalizeLang(lang);
  try {
    localStorage.setItem(LANG_KEY, clean);
  } catch {
    /* almacenamiento no disponible */
  }
  applyLanguage(clean);
}

export function initLanguage() {
  const lang = getStoredLang();
  document.documentElement.lang = lang;
  swapStatic(document, lang);
  paintSwitcher(lang);
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang-btn')));
  });
  // Avisa a los scripts de página (Dex/ficha re-renderizan valores dinámicos).
  window.dispatchEvent(new CustomEvent('digidex:lang', { detail: { lang } }));
}
