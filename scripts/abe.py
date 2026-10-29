"""Run astro-base-engine for this site: python3 scripts/abe.py <command> [args] --site site

Same as `python -m astro_base_engine`, plus two site adapters until the engine has them
(brand/ENGINE-SUGGESTIONS.md #17, #19):
- a brief's frontmatter `date: YYYY-MM-DD` becomes the page's publish date (meta.created, used for
  datePublished and post dates); the engine CLI otherwise stamps the day you run it;
- `siteRoutes.paths` in engine.config.json lists routes the site renders itself (home, game pages),
  so links to them are not reported as broken.
Engine location: ABE_ENGINE (default ../astro-engine/engine).
"""
import functools
import os
import re
import sys

sys.path.insert(0, os.path.abspath(os.environ.get('ABE_ENGINE', os.path.join(os.path.dirname(__file__), '..', '..', 'astro-engine', 'engine'))))
from astro_base_engine import build as BL, cli, site as S  # noqa: E402
import json  # noqa: E402

_site = next((sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == '--site' and i + 1 < len(sys.argv)), '.')
_cfg = os.path.join(_site, 'engine.config.json')
_routes = json.load(open(_cfg, encoding='utf-8')).get('siteRoutes', {}).get('paths', []) if os.path.exists(_cfg) else []
if _routes:
    _organize = S.organize
    _stubs = [{'id': 'site-route' + r.replace('/', '-'), 'path': r, 'sections': [], 'meta': {'pageType': 'site-route'}} for r in _routes]
    def _with_routes(pages, planned=()):
        rep = _organize(pages, list(planned) + _stubs)
        rep['orphans'] = [o for o in rep['orphans'] if o not in {S.norm(r) for r in _routes}]
        rep['tree'].pop('site-route', None)
        return rep
    S.organize = _with_routes

if len(sys.argv) > 2 and sys.argv[1] == 'produce':
    m = re.search(r'^date:\s*(\d{4}-\d{2}-\d{2})\s*$', open(sys.argv[2], encoding='utf-8').read(), re.M)
    if m:
        BL.build = functools.partial(BL.build, today=m.group(1))
sys.exit(cli.main(sys.argv[1:]))
