import { db, sortedRoutes, summary } from '@/lib/data';
import { quote } from '@/lib/fare';
import { json } from '@/lib/api';

export const dynamicParams = false;
export const generateStaticParams = () => sortedRoutes().map((r) => ({ id: r.slug }));

/** GET /api/routes/354 → the full fare chart of route A-354 (general and student fares for every pair of stops) */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = db.routeBySlug((await params).id)!;
  const stops = r.s.map((id, i) => ({ id, bn: db.stops[id], en: db.en[id], printed: r.raw[i], km: r.kmn[i] }));
  const fares = r.s.flatMap((_, i) => r.s.slice(0, i).map((__, j) => ({
    from: j, to: i, printed: r.f[i][j], general: quote(r, i, j, false), student: quote(r, i, j, true),
  })));
  const passes = r.x.map(([id, lo, km]) => ({ id, bn: db.stops[id], en: db.en[id], between: [lo, lo + 1], km }));
  return json({ ...summary(r), chartImage: r.img, note: r.note, noteEn: r.noteEn, stops, passes, fares });
}
