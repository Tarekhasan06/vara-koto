import { toBn } from './search';
import type { Lang } from './types';

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Number in the page's script; money keeps .50 for half-taka student fares. */
export const numL = (lang: Lang, x: number | string) => (lang === 'bn' ? toBn(x) : String(x));
export const money = (lang: Lang, x: number) => numL(lang, Number.isInteger(x) ? x : x.toFixed(2));
export const kmL = (lang: Lang, x: number, approx = false) =>
  numL(lang, approx ? x.toFixed(1) : (Math.round(x * 100) / 100).toString());

const bn = {
  siteName: 'ভাড়া কত?',
  tagline: 'ঢাকার বাসের সরকারি ভাড়ার চার্ট থেকে সঠিক ভাড়া',
  metaDescription: 'ঢাকার ৭৮টি বাস রুটের সরকারি ভাড়ার চার্ট থেকে যেকোনো দুই স্টপেজের মধ্যে সঠিক ভাড়া, শিক্ষার্থীর অর্ধেক ভাড়া ও বাস বদলের উপায়।',
  tabSearch: 'ভাড়া খুঁজুন', tabRoutes: 'সব রুট', langName: 'বাংলা', otherLang: 'English',
  from: 'কোথা থেকে উঠবেন', to: 'কোথায় নামবেন', placeholder: 'স্টপেজের নাম',
  clear: 'মুছুন', swap: 'দুই স্টপেজ অদলবদল করুন',
  passenger: 'যাত্রী', general: 'সাধারণ', student: 'শিক্ষার্থী (অর্ধেক ভাড়া)', studentShort: 'শিক্ষার্থী',
  minLine: 'সর্বনিম্ন ভাড়া ১০ টাকা। সাধারণ ও শিক্ষার্থী, সবার জন্য একই।',
  noStop: 'এই নামে কোনো স্টপেজ চার্টে নেই। বানান বদলে দেখুন।',
  nRoutes: (n: number) => `${toBn(n)}টি রুট`,
  taka: 'টাকা', km: 'কিমি', youPay: 'দিতে হবে', about: 'প্রায়',
  actual: (x: string) => `আসল ভাড়া ${x} টাকা`, minShort: 'সর্বনিম্ন ১০ টাকা',
  fullFare: (x: string) => `পুরো ভাড়া ${x} টাকা`, studentFare: (x: string) => `শিক্ষার্থী ${x} টাকা`,
  rangeNote: 'আগে-পরের স্টপেজের ভাড়া',
  board: 'ওঠা', stopsBetween: (n: number) => (n ? `মাঝে ${toBn(n)}টি স্টপেজ` : 'পরের স্টপেজ'),
  fromTo: (a: string, b: string) => `${a} থেকে ${b}`,
  legFare: (pay: string, orig?: string) => `${pay} টাকা${orig ? ` (আসল ${orig})` : ''}`,
  pathStops: 'পথের স্টপেজ', fullChart: (no: string) => `${no} রুটের পুরো চার্ট`,
  buses: 'বাস', cheapest: 'সবচেয়ে কম',
  changeAt: (s: string) => `${s}-এ বাস বদল`,
  unlisted: (u: string, a: string, b: string) => `${u} এই রুটের চার্টে আলাদা করে নেই; এটি ${a} ও ${b}-এর মাঝে পড়ে। তাই ভাড়া এই দুই স্টপেজের ভাড়ার মধ্যে।`,
  emptyTitle: 'কোথা থেকে কোথায় যাবেন?',
  emptyText: 'উপরে ওঠা ও নামার স্টপেজ বেছে নিন। তালিকা বর্ণানুক্রমে সাজানো; বাংলা বা ইংরেজিতে নাম লিখেও খুঁজতে পারেন।',
  throughTitle: (s: string, n: number) => `${s} দিয়ে যায় ${toBn(n)}টি রুট`,
  needTo: 'কোথায় নামবেন তা বেছে নিলে ভাড়া দেখাবে।', needFrom: 'কোথা থেকে উঠবেন তা বেছে নিলে ভাড়া দেখাবে।',
  same: 'ওঠা ও নামার স্টপেজ একই। দুটি আলাদা স্টপেজ বেছে নিন।',
  directCount: (n: number) => `সরাসরি ${toBn(n)}টি রুট, বাস বদলাতে হবে না।`,
  payRange: (lo: string, hi: string | null, st: boolean) => `দিতে হবে ${lo}${hi ? ` থেকে ${hi}` : ''} টাকা${st ? ' (শিক্ষার্থী)' : ''}।`,
  varies: 'রুটভেদে দূরত্ব আলাদা বলে ভাড়া আলাদা।',
  minNote: 'আসল ভাড়া ১০ টাকার কম হলেও সর্বনিম্ন ১০ টাকা দিতে হবে।',
  unlistedNote: 'কিছু রুটের চার্টে এই স্টপেজ আলাদা করে নেই; সেখানে ভাড়া আগের ও পরের স্টপেজের ভাড়ার মধ্যে দেখানো হয়েছে।',
  showChanges: 'বাস বদলে যাওয়ার উপায়ও দেখুন', changesTitle: 'একবার বাস বদলে',
  changesText: 'দুই বাসের ভাড়া যোগ করে দেখানো হয়েছে। প্রতিটি বাসে সর্বনিম্ন ভাড়া ১০ টাকা।',
  noChanges: 'বাস বদলে যাওয়ার সুবিধাজনক আর কোনো উপায় চার্টে পাওয়া যায়নি।',
  noDirect: (x: string, st: boolean) => `সরাসরি কোনো রুট চার্টে নেই। একবার বাস বদলে যাওয়া যাবে, সবচেয়ে কম মোট ${x} টাকা দিতে হবে${st ? ' (শিক্ষার্থী)' : ''}।`,
  none: 'এই দুই স্টপেজের মধ্যে সরাসরি বা একবার বাস বদলে যাওয়ার কোনো রুট চার্টে পাওয়া যায়নি। কাছের বড় কোনো স্টপেজ (যেমন ফার্মগেট, গাবতলী, সায়েদাবাদ) বেছে আবার চেষ্টা করুন।',
  loading: 'ভাড়া খোঁজা হচ্ছে…',
  loadError: 'ভাড়া আনা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।', retry: 'আবার চেষ্টা করুন',
  routesTitle: 'সব রুট', routesText: (r: number, s: number) => `${toBn(r)}টি রুটের ভাড়ার চার্ট, ${toBn(s)}টি স্টপেজ।`,
  filterLabel: 'রুট নম্বর, বাসের নাম বা স্টপেজের নাম দিয়ে খুঁজুন', filterPlaceholder: 'যেমন: ২৯৫ বা ফার্মগেট',
  noMatch: 'মিল পাওয়া যায়নি। রুট নম্বর বা স্টপেজের নাম অন্যভাবে লিখে দেখুন।',
  nStops: (n: number) => `${toBn(n)}টি স্টপেজ`,
  back: 'সব রুট',
  totalKm: (km: string) => `মোট ${km} কিমি`, chartImage: (n: number) => `চার্টের ছবি ${toBn(n)}.jpg`,
  alsoPasses: 'চার্টে আলাদা ঘর নেই, তবে বাসটি এসব জায়গা দিয়েও যায়:',
  getOn: 'উঠবেন', getOff: 'নামবেন', pickTwo: 'দুটি আলাদা স্টপেজ বেছে নিন।',
  calcLine: (km: string, f: string, s: string) => `${km} কিমি, পুরো ভাড়া ${f} টাকা, শিক্ষার্থী ${s} টাকা`,
  calcMin: (o: string) => `আসল ভাড়া ${o} টাকা; সর্বনিম্ন ভাড়া ১০ টাকা বলে দিতে হবে ১০ টাকা।`,
  chartTitle: 'ভাড়ার পুরো চার্ট', thStop: 'স্টপেজ', thFare: 'ভাড়া (টাকা)', thStudent: ', শিক্ষার্থী',
  chartHelp: 'প্রতিটি ঘর বাঁ দিকের স্টপেজ থেকে ওই কলামের সবুজ ঘরের স্টপেজ পর্যন্ত ভাড়া। কাটা সংখ্যাটি আসল ভাড়া; সর্বনিম্ন ভাড়া ১০ টাকা বলে তার পাশের ১০ টাকা দিতে হবে। ডানে-বাঁয়ে সরিয়ে পুরো চার্ট দেখুন।',
  footSource: 'ঢাকা মেট্রো যাত্রী ও পণ্য পরিবহন কমিটির ডিজেলচালিত বাস ভাড়ার চার্ট (প্রজ্ঞাপন: ০৭ আশ্বিন ১৪৩৩ / ২২ সেপ্টেম্বর ২০২৬)। ভাড়ার হার প্রতি কিলোমিটার ২.৭০ টাকা।',
  footMin: 'সর্বনিম্ন ভাড়া ১০ টাকা। কিলোমিটার হিসাবে ভাড়া ১০ টাকার কম হলেও ১০ টাকা দিতে হবে। শিক্ষার্থীর ভাড়া চার্টের ভাড়ার অর্ধেক, তবে অর্ধেক ১০ টাকার কম হলে শিক্ষার্থীকেও ১০ টাকা দিতে হবে। যেমন পুরো ভাড়া ১৫ টাকা হলে শিক্ষার্থী দেবেন ১০ টাকা।',
  footNote: 'প্রতিটি ভাড়া ছাপানো চার্টের ঘর থেকে নেওয়া। চার্ট অনুযায়ী এই ভাড়ার সাথে বাড়তি কোনো টাকা দাবি করা যাবে না। বাস দুই দিকেই চলে ধরে ভাড়া দেখানো হয়েছে।',
  notFound: 'এই পাতাটি পাওয়া যায়নি।', home: 'ভাড়া খোঁজার পাতায় ফিরে যান',
  rulesTitle: 'ভাড়ার নিয়ম', switchLang: 'Read in English', minTag: 'সর্বনিম্ন ভাড়া ১০ টাকা প্রযোজ্য',
};

type Dict = typeof bn;

const en: Dict = {
  siteName: 'ভাড়া কত?',
  tagline: 'Exact Dhaka bus fares from the official fare charts',
  metaDescription: 'Exact fares between any two stops on 78 Dhaka bus routes, from the official fare charts, with student half fare and one-change journeys.',
  tabSearch: 'Find fare', tabRoutes: 'All routes', langName: 'English', otherLang: 'বাংলা',
  from: 'Getting on at', to: 'Getting off at', placeholder: 'Stop name',
  clear: 'Clear', swap: 'Swap the two stops',
  passenger: 'Passenger', general: 'General', student: 'Student (half fare)', studentShort: 'Student',
  minLine: 'Minimum fare is 10 taka, the same for general passengers and students.',
  noStop: 'No stop with this name on the charts. Try another spelling.',
  nRoutes: (n) => plural(n, 'route'),
  taka: 'Tk', km: 'km', youPay: 'You pay', about: 'about',
  actual: (x) => `Actual fare ${x} Tk`, minShort: 'Minimum 10 Tk',
  fullFare: (x) => `Full fare ${x} Tk`, studentFare: (x) => `Student ${x} Tk`,
  rangeNote: 'from the stops either side',
  board: 'Board', stopsBetween: (n) => (n ? `${plural(n, 'stop')} between` : 'next stop'),
  fromTo: (a, b) => `${a} to ${b}`,
  legFare: (pay, orig) => `${pay} Tk${orig ? ` (actual ${orig})` : ''}`,
  pathStops: 'Stops on the way', fullChart: (no) => `Full chart for route ${no}`,
  buses: 'Buses', cheapest: 'Lowest',
  changeAt: (s) => `Change bus at ${s}`,
  unlisted: (u, a, b) => `${u} has no row on this route's chart; it lies between ${a} and ${b}, so the fare is between the fares to those two stops.`,
  emptyTitle: 'Where are you travelling?',
  emptyText: 'Pick where you get on and off above. The list is in alphabetical order, and you can type a name in English or Bangla.',
  throughTitle: (s, n) => `${plural(n, 'route')} pass ${s}`,
  needTo: 'Pick where you get off to see the fare.', needFrom: 'Pick where you get on to see the fare.',
  same: 'Both stops are the same. Pick two different stops.',
  directCount: (n) => `${plural(n, 'direct route')}, no bus change needed.`,
  payRange: (lo, hi, st) => `You pay ${lo}${hi ? ` to ${hi}` : ''} Tk${st ? ' (student)' : ''}.`,
  varies: 'Fares differ because the distance differs by route.',
  minNote: 'Where the actual fare is under 10 Tk you still pay the 10 Tk minimum.',
  unlistedNote: 'On some routes this stop has no row of its own on the chart; there the fare is shown between the fares to the stops before and after it.',
  showChanges: 'Also show journeys with a bus change', changesTitle: 'With one bus change',
  changesText: 'The two fares are added together. Each bus has the 10 Tk minimum.',
  noChanges: 'No sensible journey with a bus change was found on the charts.',
  noDirect: (x, st) => `No direct route on the charts. With one bus change the lowest total is ${x} Tk${st ? ' (student)' : ''}.`,
  none: 'No direct route or one-change journey between these two stops was found on the charts. Try a larger stop nearby, such as Farmgate, Gabtoli or Sayedabad.',
  loading: 'Finding fares…',
  loadError: 'Could not load the fares. Check your internet connection and try again.', retry: 'Try again',
  routesTitle: 'All routes', routesText: (r, s) => `Fare charts for ${r} routes, ${s} stops.`,
  filterLabel: 'Search by route number, bus name or stop name', filterPlaceholder: 'e.g. 295 or Farmgate',
  noMatch: 'No match. Try writing the route number or stop name another way.',
  nStops: (n) => plural(n, 'stop'),
  back: 'All routes',
  totalKm: (km) => `${km} km in total`, chartImage: (n) => `chart image ${n}.jpg`,
  alsoPasses: 'No row of their own on the chart, but the bus also passes:',
  getOn: 'Get on', getOff: 'Get off', pickTwo: 'Pick two different stops.',
  calcLine: (km, f, s) => `${km} km, full fare ${f} Tk, student ${s} Tk`,
  calcMin: (o) => `Actual fare ${o} Tk; the minimum fare is 10 Tk, so you pay 10 Tk.`,
  chartTitle: 'Full fare chart', thStop: 'Stop', thFare: 'Fare (Tk)', thStudent: ', student',
  chartHelp: 'Each cell is the fare from the stop on the left to the stop in the green cell of that column. A crossed-out number is the actual fare; with the 10 Tk minimum you pay the 10 next to it. Scroll sideways to see the whole chart.',
  footSource: 'Diesel bus fare charts of the Dhaka Metro Passenger and Goods Transport Committee (gazette of 22 September 2026 / 07 Ashwin 1433). The rate is 2.70 taka per kilometre.',
  footMin: 'The minimum fare is 10 taka. If the fare by distance is under 10 taka you still pay 10. A student pays half the chart fare, but if half is under 10 taka the student also pays 10. For example, when the full fare is 15 taka a student pays 10.',
  footNote: 'Every fare is taken from a cell of the printed chart. By the chart, nothing may be charged on top of these fares. Fares are shown assuming buses run both ways.',
  notFound: 'This page was not found.', home: 'Go to the fare finder',
  rulesTitle: 'How fares work', switchLang: 'বাংলায় পড়ুন', minTag: '10 Tk minimum applies',
};

export const dict: Record<Lang, Dict> = { bn, en };
export type { Dict };

/** route/stop helpers that pick the right language */
export const routeNo = (lang: Lang, r: { no: string; noEn: string }) => (lang === 'en' ? r.noEn : r.no);
export const routeName = (lang: Lang, r: { frm: string; to: string; frmEn: string; toEn: string }) =>
  lang === 'en' ? `${r.frmEn} ⇄ ${r.toEn}` : `${r.frm} ⇄ ${r.to}`;
export const busNames = (lang: Lang, r: { bus: string[]; busEn: string[] }) =>
  lang === 'en' ? (r.busEn.length ? r.busEn : r.bus) : (r.bus.length ? r.bus : r.busEn);
