import 'server-only';
import { db, summary, type Indexed } from './data';
import type { FareResult, Journey, Leg, PathPoint, Quote } from './types';

export const MIN_FARE = 10;

/** printed fare between chart stops i and j */
export const chartFare = (r: Indexed, i: number, j: number) => r.f[Math.max(i, j)][Math.min(i, j)];

/** fare by distance alone: 2.70 Tk per km, rounded half up, before the minimum */
function distanceFare(r: Indexed, i: number, j: number) {
  const d100 = Math.round(Math.abs(r.kmn[i] - r.kmn[j]) * 100);
  return Math.floor((d100 * 27 + 500) / 1000);
}

/** What one passenger pays between two chart stops. Students pay half the chart fare; everyone pays at least 10 Tk. */
export function quote(r: Indexed, i: number, j: number, student: boolean): Quote {
  const c = chartFare(r, i, j);
  if (student) { const half = c / 2; return { orig: half, pay: Math.max(MIN_FARE, half) }; }
  let orig = c;
  if (c <= MIN_FARE) { const d = distanceFare(r, i, j); if (d < MIN_FARE) orig = Math.min(c, d); }
  return { orig, pay: Math.max(MIN_FARE, c) };
}

const addQ = (a: Quote, b: Quote): Quote => ({ orig: a.orig + b.orig, pay: a.pay + b.pay });

function path(r: Indexed, a: number, b: number): PathPoint[] {
  const A = r.at.get(a)!, B = r.at.get(b)!;
  const lo = Math.min(A.km, B.km), hi = Math.max(A.km, B.km);
  const mid: PathPoint[] = [];
  r.s.forEach((s, p) => { if (s !== a && s !== b && r.kmn[p] > lo && r.kmn[p] < hi) mid.push({ stop: s, km: r.kmn[p], listed: true }); });
  if (A.km > B.km) mid.reverse();
  return [{ stop: a, km: A.km, listed: A.c }, ...mid, { stop: b, km: B.km, listed: B.c }];
}

/** A ride on one route from stop a to stop b, or null if this route does not carry you there. */
function leg(ri: number, a: number, b: number): Leg | null {
  const r = db.routes[ri], A = r.at.get(a), B = r.at.get(b);
  if (!A || !B) return null;
  const km = Math.abs(A.km - B.km);
  const unlisted = [A, B].flatMap((P, k) => P.c ? [] : [{ stop: k ? b : a, before: r.s[P.lo], after: r.s[P.hi] }]);
  const base = { route: r.slug, from: a, to: b, km, path: path(r, a, b), unlisted };
  if (A.c && B.c) return { ...base, exact: true, general: quote(r, A.i, B.i, false), student: quote(r, A.i, B.i, true) };
  if (km < 0.05) return null;
  // One or both stops sit between two chart stops: the fare lies between the fare over the chart
  // stops just inside the ride and the fare over the chart stops just outside it.
  const [F, Z] = A.km < B.km ? [A, B] : [B, A];
  const inF = F.c ? F.i : F.hi, inZ = Z.c ? Z.i : Z.lo, outF = F.c ? F.i : F.lo, outZ = Z.c ? Z.i : Z.hi;
  const low = inF < inZ ? chartFare(r, inF, inZ) : 0, high = chartFare(r, outF, outZ);
  const range = (h: number): Quote => {
    const lo = Math.max(MIN_FARE, low * h), hi = Math.max(MIN_FARE, high * h);
    return { lo, hi, pay: hi, orig: hi };
  };
  return { ...base, exact: false, general: range(1), student: range(0.5) };
}

const one = (l: Leg): Journey => ({ legs: [l], general: l.general, student: l.student, km: l.km });

export function findFares(from: number, to: number): FareResult {
  const direct: Journey[] = [];
  for (const ri of db.through[from]) { const l = leg(ri, from, to); if (l) direct.push(one(l)); }
  direct.sort((u, v) => Number(v.legs[0].exact) - Number(u.legs[0].exact) || u.general.pay - v.general.pay || u.km - v.km);

  // one change, between chart stops only, cheapest per pair of routes
  const best = new Map<string, Journey>();
  for (const x of db.through[from]) {
    const r1 = db.routes[x], A = r1.at.get(from)!;
    if (!A.c || r1.at.has(to)) continue;
    for (const mid of r1.s) {
      if (mid === from) continue;
      for (const y of db.through[mid]) {
        if (y === x) continue;
        const r2 = db.routes[y], M = r2.at.get(mid)!, B = r2.at.get(to);
        if (!M.c || !B || !B.c || r2.at.has(from)) continue;
        const l1 = leg(x, from, mid), l2 = leg(y, mid, to);
        if (!l1 || !l2) continue;
        const j: Journey = { legs: [l1, l2], change: mid, general: addQ(l1.general, l2.general), student: addQ(l1.student, l2.student), km: l1.km + l2.km };
        const key = `${x}_${y}`, old = best.get(key);
        if (!old || j.general.pay < old.general.pay || (j.general.pay === old.general.pay && j.km < old.km)) best.set(key, j);
      }
    }
  }
  let changes = [...best.values()].sort((u, v) => u.general.pay - v.general.pay || u.km - v.km);
  if (direct.length) {
    const top = Math.max(...direct.map((d) => d.general.pay));
    changes = changes.filter((c) => c.general.pay <= top * 1.6 + 10).slice(0, 5);
  } else changes = changes.slice(0, 8);

  const routes: FareResult['routes'] = {};
  for (const j of [...direct, ...changes]) for (const l of j.legs) routes[l.route] ??= summary(db.routeBySlug(l.route)!);
  return { from, to, direct, changes, routes };
}
