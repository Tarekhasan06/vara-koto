import type { NextRequest } from 'next/server';
import { db } from '@/lib/data';
import { findFares } from '@/lib/fare';
import { bad, json, stopParam } from '@/lib/api';

/** GET /api/fare?from=<stop id>&to=<stop id>  →  direct routes and one-change journeys with fares */
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams, n = db.stops.length;
  const from = stopParam(p.get('from'), n), to = stopParam(p.get('to'), n);
  if (from === null || to === null) return bad(`from and to must be stop ids between 0 and ${n - 1}; see /api/stops`);
  if (from === to) return bad('from and to are the same stop');
  return json(findFares(from, to));
}
