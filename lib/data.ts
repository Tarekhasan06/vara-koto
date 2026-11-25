import 'server-only';
import raw from '@/data/fares.json';
import type { FareData, RawRoute, RouteSummary, StopItem } from './types';

const DATA = raw as unknown as FareData;

export interface Indexed extends RawRoute {
  slug: string;
  kmn: number[];
  /** every stop this bus passes: listed on the chart (c) or inferred between two chart stops */
  at: Map<number, { c: true; i: number; km: number } | { c: false; lo: number; hi: number; km: number }>;
}

const routes: Indexed[] = DATA.routes.map((r) => {
  const kmn = r.km.map(Number);
  const at: Indexed['at'] = new Map();
  r.s.forEach((s, i) => at.set(s, { c: true, i, km: kmn[i] }));
  r.x.forEach(([s, lo, km]) => at.set(s, { c: false, lo, hi: lo + 1, km }));
  return { ...r, slug: r.noEn.replace(/\D/g, ''), kmn, at };
});

const through: number[][] = DATA.stops.map(() => []);
routes.forEach((r, ri) => r.at.forEach((_, s) => through[s].push(ri)));

const bySlug = new Map(routes.map((r, i) => [r.slug, i]));

export const db = {
  stops: DATA.stops,
  en: DATA.en,
  routes,
  through,
  routeBySlug: (slug: string) => {
    const i = bySlug.get(slug);
    return i === undefined ? undefined : routes[i];
  },
};

export function summary(r: Indexed): RouteSummary {
  return {
    slug: r.slug, no: r.no, noEn: r.noEn, frm: r.frm, to: r.to, frmEn: r.frmEn, toEn: r.toEn,
    bus: r.bus, busEn: r.busEn, km: r.kmn[r.kmn.length - 1], stops: r.s.length,
  };
}

export function stopItems(): StopItem[] {
  return DATA.stops.map((bn, id) => ({
    id, bn, en: DATA.en[id],
    keys: [...DATA.alias[id], ...DATA.alt[id]],
    routes: through[id].length,
  }));
}

export const sortedRoutes = () =>
  [...routes].sort((a, b) => Number(a.slug) - Number(b.slug));
