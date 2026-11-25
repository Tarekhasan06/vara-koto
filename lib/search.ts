import type { Lang, StopItem } from './types';

const BN = '০১২৩৪৫৬৭৮৯';
export const toBn = (x: string | number) => String(x).replace(/\d/g, (d) => BN[+d]);
const toAscii = (x: string) => x.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));

/** Fold away differences that do not matter when matching a name: case, digits script, punctuation, common Bangla spelling variants. */
export function norm(s: string) {
  return toAscii(s.normalize('NFC').toLowerCase())
    .replace(/[\s\-–—().,/:&'’ঃ়ঁ]/g, '')
    .replace(/ী/g, 'ি').replace(/ূ/g, 'ু').replace(/ণ/g, 'ন');
}

/** Rough sound of a name typed in English letters, so mohakhali = mahakhali and saidabad = sayedabad. */
function skel(n: string) {
  if (!/^[a-z0-9]+$/.test(n)) return '';
  const s = n.replace(/ph/g, 'f').replace(/z/g, 'j').replace(/q/g, 'k');
  return (s[0] + s.slice(1).replace(/[aeiouywh]/g, '')).replace(/(.)\1+/g, '$1');
}

interface Key { txt: string; n: string; sk: string; main: boolean }
export interface Hit { stop: StopItem; rank: number; via: string }

export function makeSearcher(stops: StopItem[]) {
  const idx = stops.map((stop) => {
    const keys: Key[] = [];
    const push = (txt: string, main: boolean) => { const n = norm(txt); keys.push({ txt, n, sk: skel(n), main }); };
    push(stop.bn, true); push(stop.en, true); stop.keys.forEach((k) => push(k, false));
    return { stop, keys };
  });
  const coll: Record<Lang, Intl.Collator> = { bn: new Intl.Collator('bn'), en: new Intl.Collator('en') };
  const name = (s: StopItem, lang: Lang) => (lang === 'en' ? s.en : s.bn);

  return function find(q: string, lang: Lang): Hit[] {
    const byName = (a: Hit, b: Hit) => coll[lang].compare(name(a.stop, lang), name(b.stop, lang));
    const n = norm(q);
    if (!n) return idx.map(({ stop }) => ({ stop, rank: 0, via: '' })).sort(byName);
    const sk = skel(n), out: Hit[] = [];
    for (const { stop, keys } of idx) {
      let rank = 99, via = '';
      for (const k of keys) {
        let v = k.n === n ? 0 : k.n.startsWith(n) ? 1 : k.n.includes(n) ? 2 : 99;
        if (v === 99 && sk.length >= 3 && k.sk) v = k.sk === sk ? 5 : k.sk.startsWith(sk) ? 6 : 99;
        if (v < 99 && !k.main) v += 0.4;
        if (v < rank) { rank = v; via = k.main ? '' : k.txt; }
      }
      if (rank < 99) out.push({ stop, rank, via });
    }
    return out.sort((a, b) => a.rank - b.rank || byName(a, b));
  };
}
