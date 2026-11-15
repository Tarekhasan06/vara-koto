#!/usr/bin/env python3
"""Inject data.json into the page template -> dist/index.html"""
import json, os
d = os.path.dirname(os.path.abspath(__file__))
data = open(os.path.join(d, 'data.json'), encoding='utf-8').read()
json.loads(data)
tpl = open(os.path.join(d, 'app', 'app.tpl.html'), encoding='utf-8').read()
assert tpl.count('/*__DATA__*/') == 1
out = tpl.replace('/*__DATA__*/', data.replace('</', '<\\/'))
os.makedirs(os.path.join(d, 'dist'), exist_ok=True)
open(os.path.join(d, 'dist', 'index.html'), 'w', encoding='utf-8').write(out)
print('dist/index.html', len(out.encode('utf-8')), 'bytes')
