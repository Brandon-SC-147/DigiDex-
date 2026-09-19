/**
 * Series de DigiDex — dataset local curado (ver README.md de esta carpeta).
 * Las agrupaciones son visuales e internas, no una clasificación oficial.
 */
import series from './series.json';

export const SERIES_GROUPS = [
  { id: 'classics', icon: 'history' },
  { id: 'new-eras', icon: 'new_releases' },
  { id: 'recent', icon: 'schedule' },
];

export function getAllSeries() {
  return series;
}

export function getSeriesSlugs() {
  return series.map((s) => s.slug);
}

export function getSeriesBySlug(slug) {
  return series.find((s) => s.slug === slug) ?? null;
}

export function getSeriesByGroup(groupId) {
  return series.filter((s) => s.group === groupId);
}

export function seriesHref(slug) {
  return `/generaciones/${slug}`;
}
