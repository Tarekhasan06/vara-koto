export type Lang = 'bn' | 'en';
export const LANGS: Lang[] = ['bn', 'en'];
export const isLang = (x: string): x is Lang => x === 'bn' || x === 'en';

/** One route as stored in data/fares.json (built from the fare-chart transcriptions in source/). */
export interface RawRoute {
  no: string;          // route number in Bangla, e.g. এ-৩৫৪
  noEn: string;        // A-354
  frm: string; to: string; frmEn: string; toEn: string;
  img: number;         // chart image number
  note: string; noteEn: string;
  bus: string[]; busEn: string[];
  s: number[];         // stop ids, in chart order
  raw: string[];       // stop names as printed on the chart
  km: string[];        // cumulative km, as printed
  f: number[][];       // f[i][j] (j < i): printed fare between stop i and stop j
  x: [number, number, number][]; // stops passed without a chart row: [stop id, chart stop before, approx km]
}

export interface FareData {
  stops: string[];     // Bangla names
  en: string[];        // English names
  alias: string[][];   // other Bangla spellings seen on the charts
  alt: string[][];     // other English spellings people type
  routes: RawRoute[];
}

/** What one passenger pays for one ride. orig: before the 10 Tk minimum. lo/hi: a range when a stop has no chart row. */
export interface Quote { orig: number; pay: number; lo?: number; hi?: number }

export interface PathPoint { stop: number; km: number; listed: boolean }

export interface Leg {
  route: string;       // route slug, e.g. "354"
  from: number; to: number;
  km: number;
  exact: boolean;      // false when either stop has no row on this route's chart
  general: Quote; student: Quote;
  path: PathPoint[];
  /** for an unlisted end stop: the chart stops either side of it */
  unlisted: { stop: number; before: number; after: number }[];
}

export interface Journey { legs: Leg[]; change?: number; general: Quote; student: Quote; km: number }

export interface RouteSummary {
  slug: string; no: string; noEn: string;
  frm: string; to: string; frmEn: string; toEn: string;
  bus: string[]; busEn: string[];
  km: number; stops: number;
}

export interface FareResult {
  from: number; to: number;
  direct: Journey[];
  changes: Journey[];
  routes: Record<string, RouteSummary>;
}

/** Light stop record sent to the browser for the pickers. */
export interface StopItem { id: number; bn: string; en: string; keys: string[]; routes: number }
