'use client';
import { useState } from 'react';
import { dict, kmL, money } from '@/lib/i18n';
import type { Lang, Quote } from '@/lib/types';
import { useStudent } from './useStudent';

interface Stop { id: number; name: string; printed: string; km: string; kmn: number }

/** Two-stop fare calculator and the full stair-step chart of one route. */
export function RouteChart({ lang, stops, cells }: { lang: Lang; stops: Stop[]; cells: { g: Quote; s: Quote }[][] }) {
  const t = dict[lang], n = stops.length;
  const [student, setStudent] = useStudent();
  const [a, setA] = useState(0), [b, setB] = useState(n - 1);
  const cell = (i: number, j: number) => cells[Math.max(i, j)][Math.min(i, j)];
  const c = a !== b ? cell(a, b) : null, q = c ? (student ? c.s : c.g) : null;
  const options = stops.map((s, i) => <option key={i} value={i}>{s.name}</option>);
  const kmCell = (v: string) => (lang === 'bn' ? v.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]) : v);

  return (
    <>
      <div className="calc">
        <div className="row">
          <div><label htmlFor="r-from">{t.getOn}</label><select id="r-from" value={a} onChange={(e) => setA(+e.target.value)}>{options}</select></div>
          <div><label htmlFor="r-to">{t.getOff}</label><select id="r-to" value={b} onChange={(e) => setB(+e.target.value)}>{options}</select></div>
        </div>
        <div className="out">
          {!c || !q ? <span className="meta">{t.pickTwo}</span> : <>
            <span className="meta">
              {t.calcLine(kmL(lang, Math.abs(stops[a].kmn - stops[b].kmn)), money(lang, c.g.pay), money(lang, c.s.pay))}
              {q.orig < q.pay && <><br />{t.calcMin(money(lang, q.orig))}</>}
            </span>
            <span className="amt">{money(lang, q.pay)}<small>{t.taka}{student ? ` (${t.studentShort})` : ''}</small></span>
          </>}
        </div>
      </div>
      <div className="tools">
        <h2>{t.chartTitle}</h2>
        <div className="seg plain" role="group" aria-label={t.passenger}>
          <button type="button" aria-pressed={!student} onClick={() => setStudent(false)}>{t.general}</button>
          <button type="button" aria-pressed={student} onClick={() => setStudent(true)}>{t.studentShort}</button>
        </div>
      </div>
      <div className="chart" tabIndex={0} aria-label={t.chartTitle}>
        <table>
          <thead><tr><th className="stop">{t.thStop}</th><th>{t.km}</th><th colSpan={n} style={{ textAlign: 'left' }}>{t.thFare}{student ? t.thStudent : ''}</th></tr></thead>
          <tbody>
            {stops.map((s, p) => (
              <tr key={p}>
                <th className="stop" scope="row">{s.printed}</th>
                <td className="km">{kmCell(s.km)}</td>
                {stops.slice(0, p).map((o, j) => {
                  const v = student ? cells[p][j].s : cells[p][j].g;
                  return <td key={j} title={`${o.name} → ${s.name}`}>{v.orig < v.pay && <s>{money(lang, v.orig)}</s>}{money(lang, v.pay)}</td>;
                })}
                <td className="diag">{s.printed}</td>
                {n - 1 - p > 0 && <td className="blank" colSpan={n - 1 - p} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sub" style={{ marginTop: 8 }}>{t.chartHelp}</p>
    </>
  );
}
