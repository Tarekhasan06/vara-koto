#!/usr/bin/env python3
"""Parse transcribed fare charts and compare every printed cell with the rate formula.

formula(i,j) = max(10, round_half_up(rate * |km_j - km_i|))
A mismatch is either a misread or a real irregularity in the printed chart;
cells marked with ! have been re-checked on an enlarged crop and are accepted.
Structural checks: row i must have exactly i values, km must increase,
last km must equal the route total.
"""
import sys, glob, json, os
from decimal import Decimal, ROUND_HALF_UP

MIN = 10

def formula(rate, a, b):
    d = abs(Decimal(b) - Decimal(a)) * Decimal(rate)
    return max(MIN, int(d.quantize(Decimal('1'), rounding=ROUND_HALF_UP)))

def parse(paths):
    routes, cur = [], None
    for p in paths:
        for ln, raw in enumerate(open(p, encoding='utf-8'), 1):
            s = raw.strip()
            if not s or s.startswith('#'):
                continue
            if s.startswith('@'):
                f = [x.strip() for x in s[1:].split('|')]
                cur = dict(img=int(f[0]), no=f[1], rate=f[2], total=f[3], frm=f[4], to=f[5],
                           note=f[6] if len(f) > 6 else '', stops=[], rows=[], ok=[])
                routes.append(cur)
            else:
                f = [x.strip() for x in s.split('|')]
                cur['stops'].append((f[0], f[1]))
                vals = [x.strip() for x in f[2].split(',')] if len(f) > 2 and f[2] else []
                cur['rows'].append([int(v.rstrip('!')) for v in vals])
                cur['ok'].append([v.endswith('!') for v in vals])
    return routes

def check(r):
    errs, diffs = [], []
    st = r['stops']
    n = len(st)
    kms = [Decimal(k) for _, k in st]
    for i in range(1, n):
        if kms[i] <= kms[i-1]:
            errs.append(f'km not increasing at {st[i][0]} ({kms[i-1]} -> {kms[i]})')
    if kms[-1] != Decimal(r['total']):
        errs.append(f'total {r["total"]} != last km {kms[-1]}')
    if kms[0] != 0:
        errs.append('first km not 0')
    for i in range(n):
        if len(r['rows'][i]) != i:
            errs.append(f'row {i} {st[i][0]}: {len(r["rows"][i])} values, expected {i}')
            continue
        for j, v in enumerate(r['rows'][i]):
            f = formula(r['rate'], st[j][1], st[i][1])
            if v != f and not r['ok'][i][j]:
                diffs.append(f'row {i} {st[i][0]}({st[i][1]}) col {j} {st[j][0]}({st[j][1]}): printed {v}, formula {f}')
            # monotonic sanity: a longer ride never costs less within a row/column
        row = r['rows'][i]
        for j in range(1, len(row)):
            if row[j] > row[j-1] and not (r['ok'][i][j] or r['ok'][i][j-1]):
                errs.append(f'row {i} {st[i][0]}: values rise left to right at col {j} ({row[j-1]} -> {row[j]})')
    for j in range(n - 1):
        col = [(10**6 if False else r['rows'][i][j]) for i in range(j + 1, n) if len(r['rows'][i]) == i and not r['ok'][i][j]]
        for k in range(1, len(col)):
            if col[k] < col[k-1]:
                errs.append(f'col {j} {st[j][0]}: values fall going down at row {j+1+k} ({col[k-1]} -> {col[k]})')
    return errs, diffs

def load():
    d = os.path.dirname(os.path.abspath(__file__))
    return parse(sorted(glob.glob(os.path.join(d, 'data', 'b*.txt'))))

if __name__ == '__main__':
    only = set(int(x) for x in sys.argv[1:])
    routes = load()
    bad = cells = accepted = 0
    seen = set()
    for r in routes:
        seen.add(r['img'])
        cells += sum(len(x) for x in r['rows'])
        accepted += sum(sum(x) for x in r['ok'])
        if only and r['img'] not in only:
            continue
        e, d = check(r)
        if e or d:
            bad += 1
            print(f'[img {r["img"]}] {r["no"]} {r["frm"]} -> {r["to"]}')
            for x in e:
                print('    STRUCT', x)
            for x in d:
                print('    DIFF  ', x)
    print(f'{len(routes)} charts, {cells} cells, {accepted} accepted irregular cells, {bad} charts with open issues')
    missing = [i for i in range(1, 81) if i not in seen]
    if missing:
        print('missing images:', missing)
