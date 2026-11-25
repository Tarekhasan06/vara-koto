'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { makeSearcher } from '@/lib/search';
import { busNames, dict, kmL, routeName, routeNo } from '@/lib/i18n';
import type { FareResult, Lang, RouteSummary, StopItem } from '@/lib/types';
import { StopPicker } from './StopPicker';
import { Results } from './Results';
import { useStudent } from './useStudent';

const idParam = (v: string | null, n: number) => (v !== null && /^\d+$/.test(v) && +v < n ? +v : null);

/** The search board and its results. The chosen stops live in the address (?from=&to=) so a search can be shared. */
export function FareFinder({ lang, stops, routes, through }: {
  lang: Lang; stops: StopItem[]; routes: Record<string, RouteSummary>; through: string[][];
}) {
  const t = dict[lang];
  const router = useRouter(), pathname = usePathname(), params = useSearchParams();
  const from = idParam(params.get('from'), stops.length), to = idParam(params.get('to'), stops.length);
  const find = useMemo(() => makeSearcher(stops), [stops]);
  const [student, setStudent] = useStudent();
  const [state, setState] = useState<{ key: string; data?: FareResult; error?: boolean }>({ key: '' });
  const [showChanges, setShowChanges] = useState(false);
  const [retry, setRetry] = useState(0);

  function setStops(f: number | null, tt: number | null) {
    const q = new URLSearchParams();
    if (f !== null) q.set('from', String(f));
    if (tt !== null) q.set('to', String(tt));
    setShowChanges(false);
    router.replace(q.size ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const key = from !== null && to !== null && from !== to ? `${from}-${to}` : '';
  useEffect(() => {
    if (!key) return;
    const ctl = new AbortController();
    fetch(`/api/fare?from=${from}&to=${to}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: FareResult) => setState({ key, data }))
      .catch((e) => { if (!ctl.signal.aborted) setState({ key, error: true }); console.warn('fare lookup failed', e); });
    return () => ctl.abort();
  }, [key, from, to, retry]);

  let body: React.ReactNode;
  if (from === null && to === null) {
    body = <><h2>{t.emptyTitle}</h2><p className="sub">{t.emptyText}</p></>;
  } else if (from === null || to === null) {
    const s = (from ?? to)!, list = through[s].map((slug) => routes[slug]);
    body = <>
      <h2>{t.throughTitle(lang === 'en' ? stops[s].en : stops[s].bn, list.length)}</h2>
      <p className="sub">{from !== null ? t.needTo : t.needFrom}</p>
      <div className="rlist">{list.map((r) => <RouteRow key={r.slug} r={r} lang={lang} />)}</div>
    </>;
  } else if (from === to) {
    body = <div className="note" style={{ marginTop: 22 }}>{t.same}</div>;
  } else if (state.key !== key || (!state.data && !state.error)) {
    body = <p className="loading" role="status">{t.loading}</p>;
  } else if (state.error) {
    body = <div className="note" style={{ marginTop: 22 }}>{t.loadError} <button className="more" onClick={() => setRetry((n) => n + 1)}>{t.retry}</button></div>;
  } else {
    body = <Results data={state.data!} lang={lang} student={student} stops={stops} showChanges={showChanges} onShowChanges={() => setShowChanges(true)} />;
  }

  return (
    <section>
      <form className="board" onSubmit={(e) => e.preventDefault()} autoComplete="off">
        <div className="fields">
          <StopPicker lang={lang} label={t.from} value={from} stops={stops} find={find} onChange={(v) => setStops(v, to)} />
          <button type="button" className="swap" aria-label={t.swap} title={t.swap} onClick={() => setStops(to, from)}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v15m0 0l-4-4m4 4l4-4M17 20V5m0 0l-4 4m4-4l4 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <StopPicker lang={lang} label={t.to} value={to} stops={stops} find={find} onChange={(v) => setStops(from, v)} />
        </div>
        <div className="who">
          <span id="who-label">{t.passenger}</span>
          <div className="seg" role="group" aria-labelledby="who-label">
            <button type="button" aria-pressed={!student} onClick={() => setStudent(false)}>{t.general}</button>
            <button type="button" aria-pressed={student} onClick={() => setStudent(true)}>{t.student}</button>
          </div>
        </div>
        <div className="minline">{t.minLine}</div>
      </form>
      <div aria-live="polite">{body}</div>
    </section>
  );
}

export function RouteRow({ r, lang }: { r: RouteSummary; lang: Lang }) {
  const t = dict[lang], buses = busNames(lang, r);
  return (
    <Link className="rrow" href={`/${lang}/routes/${r.slug}`}>
      <span className="rno">{routeNo(lang, r)}</span>
      <span className="rname">{routeName(lang, r)}{buses.length > 0 && <span className="rbus">{buses.join(', ')}</span>}</span>
      <span className="km">{kmL(lang, r.km)} {t.km}<br />{t.nStops(r.stops)}</span>
    </Link>
  );
}
