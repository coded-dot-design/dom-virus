"""Run astro-base-engine for this site: python3 scripts/abe.py <command> [args] --site site

A thin launcher: same as `python -m astro_base_engine`, with the engine found at ABE_ENGINE
(default ../astro-engine/engine). Brief dates (`date:`) and site-owned routes (`knownRoutes` in
engine.config.json) are native engine features since astro-engine 7c474b7.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.environ.get('ABE_ENGINE', os.path.join(os.path.dirname(__file__), '..', '..', 'astro-engine', 'engine'))))
from astro_base_engine import cli  # noqa: E402

sys.exit(cli.main(sys.argv[1:]))
