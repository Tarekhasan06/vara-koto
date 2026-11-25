'use client';
import { useId, useMemo, useRef, useState } from 'react';
import type { Hit } from '@/lib/search';
import { norm } from '@/lib/search';
import { dict } from '@/lib/i18n';
import type { Lang, StopItem } from '@/lib/types';

interface Props {
  lang: Lang;
  label: string;
  value: number | null;
  stops: StopItem[];
  find: (q: string, lang: Lang) => Hit[];
  onChange: (id: number | null) => void;
}

/** Text box with a sorted, searchable list of stops in both languages. */
export function StopPicker({ lang, label, value, stops, find, onChange }: Props) {
  const t = dict[lang];
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const name = (s: StopItem) => (lang === 'en' ? s.en : s.bn);
  const other = (s: StopItem) => (lang === 'en' ? s.bn : s.en);
  const chosen = value === null ? '' : name(stops[value]);

  const [text, setText] = useState<string | null>(null); // null: show the chosen stop's name
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const shown = text ?? chosen;
  const query = text ?? '';
  const typed = norm(query) !== '';
  const hits = useMemo(() => (open ? find(query, lang) : []), [open, query, lang, find]);

  function pick(stopId: number) {
    onChange(stopId); setText(null); setOpen(false); setActive(-1);
  }
  function onBlur() {
    setTimeout(() => {
      setOpen(false);
      if (text === null) return;
      if (!text.trim()) { setText(null); if (value !== null) onChange(null); return; }
      const best = find(text, lang)[0];
      if (best && best.rank < 1) pick(best.stop.id); else setText(null);
    }, 120);
  }
  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      if (!hits.length) return;
      const n = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      setActive(n);
      document.getElementById(`${id}-o${n}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const h = hits[active >= 0 ? active : 0];
      if (open && h && (typed || active >= 0)) pick(h.stop.id);
    } else if (e.key === 'Escape') setOpen(false);
  }

  let lastLetter = '';
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef} id={id} type="text" autoComplete="off" spellCheck={false}
        role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
        placeholder={t.placeholder} value={shown}
        onFocus={(e) => { e.currentTarget.select(); setText(null); setOpen(true); setActive(-1); }}
        onChange={(e) => { setText(e.target.value); setOpen(true); setActive(norm(e.target.value) ? 0 : -1); }}
        onKeyDown={onKey} onBlur={onBlur}
      />
      {shown && (
        <button type="button" className="clear" aria-label={t.clear} title={t.clear}
          onClick={() => { setText(null); onChange(null); inputRef.current?.focus(); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      )}
      {open && (
        <div className="list" id={`${id}-list`} role="listbox" onMouseDown={(e) => e.preventDefault()}>
          {hits.length === 0 && <div className="none">{t.noStop}</div>}
          {hits.map((h, k) => {
            const letter = typed ? '' : name(h.stop).trim()[0].toUpperCase();
            const group = !typed && letter !== lastLetter ? (lastLetter = letter) : null;
            return (
              <div key={h.stop.id} style={{ display: 'contents' }}>
                {group && <div className="grp" aria-hidden="true">{group}</div>}
                <div className="opt" role="option" id={`${id}-o${k}`} aria-selected={k === active} onClick={() => pick(h.stop.id)}>
                  <span><b>{name(h.stop)}</b><span className="sec">{other(h.stop)}</span>{h.via && <em>{h.via}</em>}</span>
                  <small>{t.nRoutes(h.stop.routes)}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
