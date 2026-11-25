'use client';
import { useState } from 'react';
import { norm } from '@/lib/search';
import { dict } from '@/lib/i18n';
import type { Lang, RouteSummary } from '@/lib/types';
import { RouteRow } from './FareFinder';

export function RouteList({ lang, items }: { lang: Lang; items: { route: RouteSummary; text: string }[] }) {
  const t = dict[lang];
  const [q, setQ] = useState('');
  const n = norm(q);
  const shown = n ? items.filter((i) => i.text.includes(n)) : items;
  return (
    <>
      <label htmlFor="rfilter" className="sub" style={{ display: 'block', marginBottom: 6 }}>{t.filterLabel}</label>
      <input id="rfilter" className="filter" type="text" value={q} placeholder={t.filterPlaceholder} onChange={(e) => setQ(e.target.value)} />
      <div className="rlist">
        {shown.length ? shown.map((i) => <RouteRow key={i.route.slug} r={i.route} lang={lang} />) : <div className="note">{t.noMatch}</div>}
      </div>
    </>
  );
}
