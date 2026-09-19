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

/**
 * TAXONOMÍA DIGIMON: los valores originales de Digi-API se conservan tal cual
 * en la presentación (niveles, atributos y tipos NO se traducen).
 * Solo los Fields tienen equivalencias visuales curadas; el resto es original.
 */
export function localizeLevel(value, lang) {
  void lang;
  return value ?? '';
}

export function localizeAttr(value, lang) {
  void lang;
  return value ?? '';
}

export function localizeType(value, lang) {
  void lang;
  return value ?? '';
}

const FIELD_ES = {
  'Metal Empire': 'Imperio Metálico',
  'Nature Spirits': 'Espíritus de la Naturaleza',
  'Nightmare Soldiers': 'Soldados de Pesadilla',
  "Dragon's Roar": 'Rugido del Dragón',
  'Dark Area': 'Área Oscura',
};

/** Fields: traducción visual solo con equivalencia clara; si no, original. */
export function localizeField(value, lang) {
  if (normalizeLang(lang) === 'en') return value ?? '';
  return FIELD_ES[value] ?? value ?? '';
}

import descriptionsEs from '../data/translations/descriptions.es.json';
import skillsEs from '../data/translations/skills.es.json';

/**
 * Descripción dinámica por ID: EN muestra el original; ES muestra la
 * traducción local cuando existe (`translated: true`) y si no, el original.
 */
export function localizeDescription(detail, lang) {
  const original = detail?.description || '';
  if (normalizeLang(lang) === 'en') return { text: original, translated: true };
  const entry = descriptionsEs[String(detail?.id)];
  if (entry?.description) return { text: entry.description, translated: true };
  return { text: original, translated: false };
}

/** Descripción de skill por ID de skill; si no hay, el original (o ''). */
export function localizeSkillDescription(skill, lang) {
  const original = skill?.description || '';
  if (normalizeLang(lang) === 'en') return original;
  return skillsEs[String(skill?.id)]?.description ?? original;
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
