#!/usr/bin/env python3
"""Find stops a bus passes without its own row on that route's fare chart.

Route X has two neighbouring chart stops A, B. If another route Y also runs A -> B over (nearly) the same
distance and has its own stops between them, those stops lie on X's road too. X's chart has no fare for them,
so the app can only bound the fare by the chart stops on either side.

Guards against a different road of similar length:
  * the A-B distance on the two charts must agree closely;
  * within one gap only the best-agreeing chart is trusted; another chart adds stops only if it lists
    every stop the trusted chart lists there (so it is plainly the same stretch, in more detail).
"""
import json, sys

ABS_TOL, REL_TOL = 0.3, 0.03     # how closely the A-B distance must agree between the two charts

def infer(data, verbose=False):
    S, R = data['stops'], data['routes']
    KM = [[float(k) for k in r['km']] for r in R]
    out = []
    for xi, X in enumerate(R):
        km = KM[xi]
        have = set(X['s'])
        found = {}
        for p in range(len(X['s']) - 1):
            A, B = X['s'][p], X['s'][p + 1]
            dX = km[p + 1] - km[p]
            donors = []
            for yi, Y in enumerate(R):
                if yi == xi or A not in Y['s'] or B not in Y['s']:
                    continue
                a, b = Y['s'].index(A), Y['s'].index(B)
                if abs(a - b) < 2:
                    continue
                ykm = KM[yi]
                dY = abs(ykm[b] - ykm[a])
                err = abs(dY - dX)
                if err > max(ABS_TOL, REL_TOL * dX) + 1e-9:
                    continue
                step = 1 if b > a else -1
                between = [(Y['s'][q], abs(ykm[q] - ykm[a]) / dY) for q in range(a + step, b, step)]
                if any(u in have for u, _ in between):
                    continue            # X lists that stop elsewhere: not the same stretch of road
                donors.append((round(err, 3), -len(between), Y['no'], between))
            if not donors:
                continue
            donors.sort()
            trusted = dict()
            for err, _, no, between in donors:
                names = {u for u, _ in between}
                if not trusted or names >= set(trusted):
                    for u, frac in between:
                        trusted.setdefault(u, dict(s=u, lo=p, km=round(km[p] + frac * dX, 2), err=err, donor=no))
            for u, c in trusted.items():
                found.setdefault(u, c)
        extra = sorted(found.values(), key=lambda c: c['km'])
        out.append(extra)
        if verbose and extra:
            print(X['no'], X['frm'], '->', X['to'], ':', ', '.join(
                f"{S[c['s']]}({S[X['s'][c['lo']]]}|{S[X['s'][c['lo']+1]]} {c['err']:.1f})" for c in extra))
    return out

if __name__ == '__main__':
    d = json.load(open('data.json', encoding='utf-8'))
    ex = infer(d, verbose=len(sys.argv) > 1)
    print(sum(len(e) for e in ex), 'unlisted stops found on', sum(1 for e in ex if e), 'routes')
    S = d['stops']
    for name in ('উত্তরা', 'মতিঝিল', 'মানিকনগর', 'বাংলামোটর', 'কাওরান বাজার'):
        i = S.index(name)
        print(name, 'unlisted on:', [R['no'] for R, e in zip(d['routes'], ex) if any(c['s'] == i for c in e)])
