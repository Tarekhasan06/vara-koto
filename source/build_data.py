#!/usr/bin/env python3
"""Turn the verified transcriptions into the app's data (JSON), merging spelling variants of stop names."""
import json, sys, collections
import verify

# spelling variant -> one canonical name (only where it is clearly the same place)
ALIAS = {
 'অরিজিনাল দশ': 'অরিজিনাল-১০',
 'আনসারক্যাম্প': 'আনসার ক্যাম্প',
 'আসাদ গেইট': 'আসাদগেট', 'আসাদগেইট': 'আসাদগেট',
 'আজিমপুর (ঢাকেশ্বরী)': 'আজিমপুর',
 'ইপিজেট': 'ইপিজেড',
 'ইসিবি মোড়': 'ইসিবি চত্বর', 'মানিকদি (ইসিবি মোড়)': 'ইসিবি চত্বর',
 'বিমানবন্দর': 'এয়ারপোর্ট', 'নিউ এয়ারপোর্ট': 'এয়ারপোর্ট',
 'কমলাপুর ষ্টেশন': 'কমলাপুর', 'কমলাপুর (পীরজঙ্গী মাজার)': 'পীরজঙ্গী মাজার',
 'কলেজ গেইট': 'কলেজগেট', 'কলেজগেইট': 'কলেজগেট',
 'কাঁচপুর ব্রীজ': 'কাঁচপুর',
 'কাওরানবাজার': 'কাওরান বাজার',
 'কাকলি': 'কাকলী',
 'কাজিপাড়া': 'কাজীপাড়া',
 'কালশি': 'কালশী', 'কালশি মোড়': 'কালশী', 'কালশিমোড়': 'কালশী', 'কালশী মোড়': 'কালশী',
 'কালশীর মোড়': 'কালশী', 'কালসী': 'কালশী',
 'কুড়িল': 'কুড়িল বিশ্বরোড', 'বিশ্বরোড': 'কুড়িল বিশ্বরোড',
 'কেরানীগঞ্জ (নতুন জেল খানা)': 'কেরানীগঞ্জ (নতুন জেলখানা)',
 'কোণাখোলা বাজার': 'কোনাখোলা',
 'কোণাবাড়ী': 'কোনাবাড়ী',
 'খাশিয়াখালী বেড়িবাঁধ': 'খাসিয়াখালী বেড়িবাঁধ', 'বেড়ীবাঁধ': 'খাসিয়াখালী বেড়িবাঁধ',
 'খাইস্যাখালী বৌড়বাধ': 'খাসিয়াখালী',
 'চৌরাস্তা': 'গাজীপুর চৌরাস্তা', 'জয়দেবপুর চৌরাস্তা': 'গাজীপুর চৌরাস্তা',
 'গাবতলি': 'গাবতলী', 'গাবতলী ব্রীজ পাড়': 'গাবতলী',
 'গুলিস্তান মোড়': 'গুলিস্তান', 'গুলিস্থান': 'গুলিস্তান',
 'ঘাটার চর': 'ঘাটারচর',
 'চাঁনখারপুল': 'চানখাঁরপুল', 'চানখারপুর': 'চানখাঁরপুল', 'চানখারপুল': 'চানখাঁরপুল',
 'ঝিগাতলা': 'জিগাতলা',
 'টংগী': 'টঙ্গী', 'টঙ্গীবাজার': 'টঙ্গী',
 'টংগী (বাস্তুহারা)': 'টঙ্গী (বাস্তুহারা)', 'টংগী বাস্তুহারা': 'টঙ্গী (বাস্তুহারা)',
 'টকরপুর': 'টিকরপুর',
 'দিয়াবাড়ী': 'দিয়াবাড়ী (মিরপুর)', 'দিয়াবাড়ী (বেড়িবাঁধ)': 'দিয়াবাড়ী (মিরপুর)', 'দিয়াবাড়ী মোড়': 'দিয়াবাড়ী (মিরপুর)',
 'ধউর মোড়': 'ধউর',
 'ধানমন্ডী-১৫': 'ধানমন্ডি-১৫', 'ধানমন্ডি': 'ধানমন্ডি-১৫',
 'নন্দনপার্ক': 'নন্দন পার্ক',
 'নবীনগর (সাভার)': 'নবীনগর',
 'নাঃগঞ্জ লিংক রোড': 'নারায়ণগঞ্জ লিংক রোড', 'নারায়নগঞ্জ লিংক রোড': 'নারায়ণগঞ্জ লিংক রোড', 'লিংক রোড': 'নারায়ণগঞ্জ লিংক রোড',
 'নারায়নগঞ্জ': 'নারায়ণগঞ্জ',
 'নিউমার্কেট': 'নিউ মার্কেট',
 'পল্লবী (মিরপুর-১২)': 'মিরপুর-১২',
 'পুরবী': 'পূরবী',
 'পোস্তগোলা ব্রীজ': 'পোস্তগোলা',
 'প্রগতি সরনী': 'প্রগতি সরণী',
 'ফুলবাড়ীয়া': 'ফুলবাড়িয়া',
 'ফ্যান্টাসী': 'ফ্যান্টাসি কিংডম',
 'বছিলা': 'বসিলা', 'বসিলা ব্রীজ': 'বসিলা',
 'বনশ্রী (মেরাদিয়া)': 'বনশ্রী',
 'রামপুরা (বনশ্রী)': 'রামপুরা', 'রামপুরা ব্রীজ': 'রামপুরা',
 'বাংলা মটর': 'বাংলামোটর', 'বাংলামটর': 'বাংলামোটর',
 'বাড্ডা লিংক রোড/মধ্য বাড্ডা': 'বাড্ডা লিংক রোড',
 'মহাখালী আমতলী': 'মহাখালী',
 'মানিক মিয়া': 'মানিক মিয়া এভিনিউ', 'মানিকমিয়া এভিনিউ': 'মানিক মিয়া এভিনিউ',
 'মিরপুর ডিওএইচ এস': 'মিরপুর ডিওএইচএস',
 'মেঘনাঘাট': 'মেঘনা ঘাট',
 'মেরাদিয়া (নতুন রাস্তা)': 'মেরাদিয়া', 'মেরাদিয়া বাজার': 'মেরাদিয়া',
 'মোঃ জিল্লুর রহমান ফ্লাইওভার': 'জিল্লুর রহমান ফ্লাইওভার',
 'মোগড়া পাড়া': 'মোগড়াপাড়া (সোনারগাঁও)', 'সোনারগাঁও মোগড়া পাড়া': 'মোগড়াপাড়া (সোনারগাঁও)',
 'মোঃপুর': 'মোহাম্মদপুর', 'মোঃবাসস্ট্যান্ড': 'মোহাম্মদপুর',
 'মোঃপুর টাউন হল': 'মোহাম্মদপুর টাউন হল', 'টাউন হল': 'মোহাম্মদপুর টাউন হল',
 'শিয়া মসজিদ': 'মোহাম্মদপুর শিয়া মসজিদ',
 'শনিরআখড়া': 'শনির আখড়া',
 'শাওড়া বাজার': 'শেওড়া বাজার',
 'সাইন্সল্যাব': 'সায়েন্স ল্যাব', 'সাইন্সল্যাবঃ': 'সায়েন্স ল্যাব', 'সায়েন্সল্যাব': 'সায়েন্স ল্যাব',
 'সায়দাবাদ': 'সায়েদাবাদ',
 'স্টাফ কোয়ার্টার': 'ডেমরা স্টাফ কোয়ার্টার',
 'মেয়র মোহাম্মদ ফ্লাইওভার': 'হানিফ ফ্লাইওভার',
 'মাওয়া ফেরীঘাট': 'মাওয়া',
 'তাতি বাজার': 'তাঁতী বাজার',
}
# same spelling, different place: per-chart overrides (image, printed name) -> canonical
OVERRIDE = {
 (80, 'সোনারগাঁও'): 'সোনারগাঁও হোটেল মোড়',     # between রেইনবো and রাসেল স্কয়ার, not the upazila
 (19, 'শ্যামলী'): 'শ্যামলী (শংকর–ধানমন্ডি অংশ)',   # printed between শংকর and ধানমন্ডি on এ-৪০৬; kept apart from শ্যামলী
}
# extra search words for a canonical stop
EXTRA = {
 'মিরপুর-১২': ['পল্লবী'],
 'ভিক্টোরিয়া পার্ক': ['সদরঘাট', 'জগন্নাথ'],
 'এয়ারপোর্ট': ['বিমানবন্দর'],
 'হানিফ ফ্লাইওভার': ['মেয়র হানিফ'],
 'গাজীপুর চৌরাস্তা': ['জয়দেবপুর'],
}
MINFARE = 10
NOTE_BN = {
 11: 'ছাপানো চার্টে গুলিস্তানের কলাম দুইবার আছে; এখানে একবার রাখা হয়েছে।',
 17: 'চার্টের শিরোনামে মোট দূরত্ব ৬১.১৫ কিমি, ছকে শেষ স্টপেজে ৬১.২ কিমি লেখা। ভাড়া ৬১.১৫ কিমি ধরে ছাপা।',
 19: 'ছাপানো চার্টে শংকর ও ধানমন্ডির মাঝে “শ্যামলী” লেখা আছে; এটি মূল শ্যামলী স্টপেজ থেকে আলাদা রাখা হয়েছে।',
 20: 'ছাপানো চার্টে শেষ দুই স্টপেজের নাম “খাইস্যাখালী বৌড়বাঁধ” ও “বেড়ীবাঁধ”।',
 26: 'ছাপানো ছকটি সায়েদাবাদ থেকে বালুঘাটের দিকে সাজানো।',
 48: 'চার্টের শিরোনামে মোট দূরত্ব ৪৫.৩০ কিমি, ছকে শেষ স্টপেজে ৪৫.৫ কিমি লেখা।',
 68: 'চার্টের শিরোনামে মোট দূরত্ব ২১.৬ কিমি, ছকে শেষ স্টপেজে ১৯.৯ কিমি লেখা।',
 70: 'ছাপানো চার্টে নিউ মার্কেট–মানিক মিয়া এভিনিউ ঘরে ৮ টাকা লেখা; সর্বনিম্ন ভাড়া ১০ টাকা বলে দিতে হবে ১০ টাকা।',
 80: 'চার্টের “সোনারগাঁও” স্টপেজটি রেইনবো ও রাসেল স্কয়ারের মাঝে; এখানে “সোনারগাঁও হোটেল মোড়” নামে দেখানো হয়েছে।',
}
import unicodedata
def N(x): return unicodedata.normalize('NFC', x)
ALIAS = {N(k): N(v) for k, v in ALIAS.items()}
OVERRIDE = {(i, N(k)): N(v) for (i, k), v in OVERRIDE.items()}
EXTRA = {N(k): [N(x) for x in v] for k, v in EXTRA.items()}

NOTE_EN = {
 11: 'The printed chart repeats the Gulistan column twice; it is kept once here.',
 17: 'The chart heading gives the total as 61.15 km, the table prints 61.2 km at the last stop. Fares are printed for 61.15 km.',
 19: 'The printed chart shows a stop named "Shyamoli" between Shankar and Dhanmondi; it is kept apart from the main Shyamoli stop.',
 20: 'On the printed chart the last two stops are named "Khaisyakhali Beribadh" and "Beribadh".',
 26: 'The printed table runs from Sayedabad towards Balughat.',
 48: 'The chart heading gives the total as 45.30 km, the table prints 45.5 km at the last stop.',
 68: 'The chart heading gives the total as 21.6 km, the table prints 19.9 km at the last stop.',
 70: 'The printed chart shows 8 taka for New Market to Manik Mia Avenue; with the 10 taka minimum you pay 10.',
 80: 'The chart stop "Sonargaon" lies between Rainbow and Russell Square; it is shown here as "Sonargaon Hotel Mor".',
}
BN_DIGITS = '০১২৩৪৫৬৭৮৯'
def no_en(no):
    return no.replace('এ', 'A').translate({ord(b): str(i) for i, b in enumerate(BN_DIGITS)})

def load_en(path):
    en, alt = {}, {}
    for raw in open(path, encoding='utf-8'):
        t = raw.strip()
        if not t or t.startswith('#'):
            continue
        f = [x.strip() for x in t.split('|')]
        en[N(f[0])] = f[1]
        alt[N(f[0])] = [x.strip() for x in f[2].split(',') if x.strip()] if len(f) > 2 else []
    return en, alt

def load_buses(path):
    out = {}
    for raw in open(path, encoding='utf-8'):
        t = raw.strip()
        if not t or t.startswith('#'):
            continue
        f = [x.strip() for x in t.split('|')]
        out[N(f[0])] = ([x.strip() for x in f[1].split(',') if x.strip()],
                        [x.strip() for x in f[2].split(',') if x.strip()] if len(f) > 2 else [])
    return out

def canon(img, name):
    name = N(name)
    if (img, name) in OVERRIDE:
        return OVERRIDE[(img, name)]
    return ALIAS.get(name, name)

def build():
    import os, infer
    here = os.path.dirname(os.path.abspath(__file__))
    EN, ALT = load_en(os.path.join(here, 'data', 'names_en.txt'))
    BUS = load_buses(os.path.join(here, 'data', 'buses.txt'))
    rs = verify.load()
    known = {N(r['no']) for r in rs}
    assert not [k for k in BUS if k not in known], 'buses.txt names a route that has no chart'
    stops = {}            # canonical -> id
    variants = collections.defaultdict(set)
    routes = []
    irregular = 0
    for r in sorted(rs, key=lambda r: r['img']):
        ids = []
        for raw, _ in r['stops']:
            c = canon(r['img'], raw)
            if c not in stops:
                stops[c] = len(stops)
            variants[c].add(N(raw))
            ids.append(stops[c])
        assert len(set(ids)) == len(ids), (r['img'], 'a stop repeats inside one route after merging')
        rows = []
        for i, row in enumerate(r['rows']):
            rows.append(list(row))   # printed value; the 10 Tk minimum is applied in the app
            irregular += sum(1 for v in row if v < MINFARE)
        routes.append(dict(
            no=r['no'], noEn=no_en(r['no']), frm=N(r['frm']), to=N(r['to']), frmEn=EN.get(N(r['frm'])), toEn=EN.get(N(r['to'])),
            img=r['img'], note=NOTE_BN.get(r['img'], ''), noteEn=NOTE_EN.get(r['img'], ''),
            bus=BUS.get(N(r['no']), ([], []))[0], busEn=BUS.get(N(r['no']), ([], []))[1],
            s=ids, raw=[N(raw) for raw, _ in r['stops']], km=[k for _, k in r['stops']], f=rows))
    used = {N(raw) for r in rs for raw, _ in r['stops']}
    unused = [k for k in ALIAS if k not in used]
    assert not unused, ('alias keys that match nothing', unused)
    names = [None] * len(stops)
    for c, i in stops.items():
        names[i] = c
    alias = []
    for i, c in enumerate(names):
        extra = sorted((variants[c] | set(EXTRA.get(c, []))) - {c})
        alias.append(extra)
    missing = [c for c in names if c not in EN] + [x for r in routes for x in (r['frm'], r['to']) if x not in EN]
    assert not missing, ('no English name for', missing)
    data = dict(stops=names, en=[EN[c] for c in names], alias=alias, alt=[ALT[c] for c in names], routes=routes)
    extra = infer.infer(data)
    for r, ex in zip(routes, extra):
        r['x'] = [[c['s'], c['lo'], c['km']] for c in ex]     # stops passed without a chart row: [stop, chart stop before, approx km]
    return data, irregular

if __name__ == '__main__':
    data, irr = build()
    json.dump(data, open('data.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(data['stops']), 'stops,', len(data['routes']), 'routes,', irr, 'printed cells below the minimum;',
          sum(len(r['x']) for r in data['routes']), 'unlisted stops;', sum(1 for r in data['routes'] if r['bus']), 'routes with bus names')
    # report
    import os
    print('size', os.path.getsize('data.json'))
    nos = collections.Counter(r['no'] for r in data['routes'])
    print('duplicate route numbers:', [k for k, v in nos.items() if v > 1])
    deg = collections.Counter()
    for r in data['routes']:
        for s in r['s']: deg[s] += 1
    print('stops on one route only:', sum(1 for s in deg.values() if s == 1))
