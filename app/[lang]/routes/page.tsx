import type { Metadata } from 'next';
import { db, sortedRoutes, summary } from '@/lib/data';
import { dict } from '@/lib/i18n';
import { norm } from '@/lib/search';
import { RouteList } from '@/components/RouteList';
import type { Lang } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: dict[lang].routesTitle };
}

export default async function RoutesPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = dict[lang];
  const items = sortedRoutes().map((r) => ({
    route: summary(r),
    text: norm([r.no, r.noEn, r.frm, r.to, r.frmEn, r.toEn, ...r.bus, ...r.busEn, ...r.raw,
      ...[...r.at.keys()].flatMap((s) => [db.stops[s], db.en[s]])].join('|')),
  }));
  return (
    <section className="narrow">
      <h2>{t.routesTitle}</h2>
      <p className="sub">{t.routesText(items.length, db.stops.length)}</p>
      <RouteList lang={lang} items={items} />
    </section>
  );
}
