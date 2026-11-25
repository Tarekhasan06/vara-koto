import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db, sortedRoutes, summary } from '@/lib/data';
import { quote } from '@/lib/fare';
import { busNames, dict, kmL, routeName, routeNo } from '@/lib/i18n';
import { LANGS, type Lang } from '@/lib/types';
import { RouteChart } from '@/components/RouteChart';

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.flatMap((lang) => sortedRoutes().map((r) => ({ lang, id: r.slug })));

type P = { params: Promise<{ lang: Lang; id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, id } = await params;
  const r = db.routeBySlug(id);
  return r ? { title: `${routeNo(lang, r)} ${routeName(lang, r)}` } : {};
}

export default async function RoutePage({ params }: P) {
  const { lang, id } = await params;
  const r = db.routeBySlug(id);
  if (!r) notFound();
  const t = dict[lang], s = summary(r), buses = busNames(lang, s);
  const note = lang === 'en' ? r.noteEn : r.note;
  // fares for every pair of chart stops, worked out here so the browser only draws them
  const cells = r.s.map((_, i) => r.s.slice(0, i).map((__, j) => ({ g: quote(r, i, j, false), s: quote(r, i, j, true) })));
  const stops = r.s.map((sid, i) => ({ id: sid, name: lang === 'en' ? db.en[sid] : db.stops[sid], printed: lang === 'en' ? db.en[sid] : r.raw[i], km: r.km[i], kmn: r.kmn[i] }));
  const passes = r.x.map(([sid]) => (lang === 'en' ? db.en[sid] : db.stops[sid]));
  return (
    <section>
      <Link className="back" href={`/${lang}/routes`}>{t.back}</Link>
      <h1 style={{ fontSize: 30, margin: '10px 0 4px' }}>
        <span className="rno" style={{ fontSize: 22, verticalAlign: 'middle' }}>{routeNo(lang, s)}</span> {routeName(lang, s)}
      </h1>
      <div className="facts" style={{ marginBottom: 6 }}>
        <span>{t.totalKm(kmL(lang, s.km))}</span><span>{t.nStops(s.stops)}</span><span>{t.chartImage(r.img)}</span>
      </div>
      {buses.length > 0 && <div className="busline">{t.buses}: <b>{buses.join(', ')}</b></div>}
      {note && <div className="note" style={{ margin: '12px 0' }}>{note}</div>}
      <RouteChart lang={lang} stops={stops} cells={cells} />
      {passes.length > 0 && <p className="hint" style={{ marginTop: 10 }}>{t.alsoPasses} {passes.join(', ')}</p>}
    </section>
  );
}
