'use client';
import Link from 'next/link';
import { busNames, dict, kmL, money, routeName, routeNo } from '@/lib/i18n';
import type { FareResult, Journey, Lang, Leg, Quote, RouteSummary, StopItem } from '@/lib/types';

interface Ctx { lang: Lang; student: boolean; stops: StopItem[]; routes: Record<string, RouteSummary> }

const amount = (lang: Lang, q: Quote) => (q.lo !== undefined && q.lo !== q.hi ? `${money(lang, q.lo)}–${money(lang, q.hi!)}` : money(lang, q.pay));

function PriceBox({ j, c, best }: { j: Journey; c: Ctx; best: boolean }) {
  const t = dict[c.lang], q = c.student ? j.student : j.general, other = c.student ? j.general : j.student;
  const ranged = q.lo !== undefined && q.lo !== q.hi;
  return (
    <div className="price">
      {best && <span className="bestmark">{t.cheapest}</span>}
      {c.student && <span className="tag">{t.studentShort}</span>}
      <span className="cap">{t.youPay}</span>
      <span className={`amt${ranged ? ' range' : ''}`}>{amount(c.lang, q)}<small>{t.taka}</small></span>
      {j.legs.some((l) => !l.exact) && <span className="fine">{t.rangeNote}</span>}
      {q.orig < q.pay && <span className="minbox"><span>{t.actual(money(c.lang, q.orig))}</span><span>{t.minShort}</span></span>}
      <span className="fine">{c.student ? t.fullFare(amount(c.lang, other)) : t.studentFare(amount(c.lang, other))}</span>
    </div>
  );
}

function LegView({ l, c, showFare }: { l: Leg; c: Ctx; showFare: boolean }) {
  const t = dict[c.lang], r = c.routes[l.route], nm = (id: number) => (c.lang === 'en' ? c.stops[id].en : c.stops[id].bn);
  const q = c.student ? l.student : l.general, start = l.path[0].km;
  const buses = busNames(c.lang, r);
  return (
    <div className="leg">
      <div className="head"><span className="rno">{routeNo(c.lang, r)}</span><span className="rname">{routeName(c.lang, r)}</span></div>
      {buses.length > 0 && <div className="busline">{t.buses}: <b>{buses.join(', ')}</b></div>}
      <div className="facts">
        {showFare && <span>{t.fromTo(nm(l.from), nm(l.to))}</span>}
        <span>{l.exact ? kmL(c.lang, l.km) : `${t.about} ${kmL(c.lang, l.km, true)}`} {t.km}</span>
        <span>{t.stopsBetween(l.path.length - 2)}</span>
        {showFare && <span>{t.legFare(amount(c.lang, q), q.orig < q.pay ? money(c.lang, q.orig) : undefined)}</span>}
      </div>
      {l.unlisted.map((u) => <p className="hint" key={u.stop}>{t.unlisted(nm(u.stop), nm(u.before), nm(u.after))}</p>)}
      <details className="way">
        <summary>{t.pathStops}</summary>
        <ol className="path">
          {l.path.map((p, k) => {
            const d = Math.abs(p.km - start), exact = p.listed && l.path[0].listed;
            return (
              <li key={p.stop} className={`${k === 0 || k === l.path.length - 1 ? 'end' : ''}${p.listed ? '' : ' un'}`}>
                <span>{nm(p.stop)}</span>
                <span>{k === 0 ? t.board : `${exact ? '' : '≈ '}${kmL(c.lang, d, !exact)} ${t.km}`}</span>
              </li>
            );
          })}
        </ol>
        <Link href={`/${c.lang}/routes/${r.slug}`}>{t.fullChart(routeNo(c.lang, r))}</Link>
      </details>
    </div>
  );
}

function Ticket({ j, c, best = false }: { j: Journey; c: Ctx; best?: boolean }) {
  const t = dict[c.lang];
  return (
    <article className={`ticket${best ? ' best' : ''}`}>
      <div className="main">
        <LegView l={j.legs[0]} c={c} showFare={j.legs.length > 1} />
        {j.legs.length > 1 && <>
          <div className="change">{t.changeAt(c.lang === 'en' ? c.stops[j.change!].en : c.stops[j.change!].bn)}</div>
          <LegView l={j.legs[1]} c={c} showFare />
        </>}
      </div>
      <PriceBox j={j} c={c} best={best} />
    </article>
  );
}

export function Results({ data, lang, student, stops, showChanges, onShowChanges }: {
  data: FareResult; lang: Lang; student: boolean; stops: StopItem[]; showChanges: boolean; onShowChanges: () => void;
}) {
  const t = dict[lang], c: Ctx = { lang, student, stops, routes: data.routes };
  const pay = (j: Journey) => (student ? j.student : j.general).pay;
  const nm = (id: number) => (lang === 'en' ? stops[id].en : stops[id].bn);
  const title = <h2>{t.fromTo(nm(data.from), nm(data.to))}</h2>;

  if (!data.direct.length) {
    if (!data.changes.length) return <>{title}<div className="note">{t.none}</div></>;
    const cs = [...data.changes].sort((a, b) => pay(a) - pay(b));
    return <>{title}<p className="sub">{t.noDirect(money(lang, pay(cs[0])), student)}</p>
      <div className="stack">{cs.map((j, k) => <Ticket key={k} j={j} c={c} />)}</div></>;
  }

  const exact = data.direct.filter((j) => j.legs[0].exact).sort((a, b) => pay(a) - pay(b) || a.km - b.km);
  const approx = data.direct.filter((j) => !j.legs[0].exact).sort((a, b) => pay(a) - pay(b));
  const lo = exact.length ? pay(exact[0]) : null, hi = exact.length ? pay(exact[exact.length - 1]) : null;
  const notes = [t.directCount(data.direct.length)];
  if (lo !== null) notes.push(t.payRange(money(lang, lo), hi !== lo ? money(lang, hi!) : null, student));
  if (lo !== null && hi !== lo) notes.push(t.varies);
  if (exact.some((j) => { const q = student ? j.student : j.general; return q.orig < q.pay; })) notes.push(t.minNote);
  if (approx.length) notes.push(t.unlistedNote);
  const changes = [...data.changes].sort((a, b) => pay(a) - pay(b));

  return (
    <>
      {title}
      <p className="sub">{notes.join(' ')}</p>
      <div className="stack">
        {exact.map((j, k) => <Ticket key={`e${k}`} j={j} c={c} best={pay(j) === lo && hi !== lo} />)}
        {approx.map((j, k) => <Ticket key={`a${k}`} j={j} c={c} />)}
      </div>
      {showChanges ? (
        changes.length ? <>
          <h2>{t.changesTitle}</h2><p className="sub">{t.changesText}</p>
          <div className="stack">{changes.map((j, k) => <Ticket key={`c${k}`} j={j} c={c} />)}</div>
        </> : <div className="note" style={{ marginTop: 16 }}>{t.noChanges}</div>
      ) : (
        <div className="stack" style={{ marginTop: 14 }}><button className="more" onClick={onShowChanges}>{t.showChanges}</button></div>
      )}
    </>
  );
}
