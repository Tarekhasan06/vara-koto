import { Suspense } from 'react';
import { db, sortedRoutes, stopItems, summary } from '@/lib/data';
import { FareFinder } from '@/components/FareFinder';
import type { Lang, RouteSummary } from '@/lib/types';

export default async function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const stops = stopItems();
  const routes: Record<string, RouteSummary> = {};
  for (const r of sortedRoutes()) routes[r.slug] = summary(r);
  const through = db.through.map((list) => list.map((ri) => db.routes[ri].slug));
  return (
    <Suspense>
      <FareFinder lang={lang} stops={stops} routes={routes} through={through} />
    </Suspense>
  );
}
