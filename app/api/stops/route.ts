import type { NextRequest } from 'next/server';
import { stopItems } from '@/lib/data';
import { makeSearcher } from '@/lib/search';
import { json } from '@/lib/api';

const items = stopItems();
const find = makeSearcher(items);

/** GET /api/stops            → every stop (id, Bangla and English name, number of routes)
 *  GET /api/stops?q=farmgate → stops matching a name typed in Bangla or English, best first */
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'bn';
  const hits = find(q, lang).slice(0, q ? 20 : undefined);
  return json(hits.map(({ stop }) => ({ id: stop.id, bn: stop.bn, en: stop.en, routes: stop.routes })));
}
