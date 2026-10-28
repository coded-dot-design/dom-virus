# Engine baseline

The builds every engine port (E3) is compared against.

- `versions.json`: the commit of every repo at the baseline, plus the game and Battlefield versions.
- `summary.md` and `<app>.json`: performance numbers from `npm run perf:baseline` (4x CPU throttle,
  10s of play after a 2s warm-up, 1440x900). Re-run on the same machine before comparing.

## Tag the baseline (needs push access)

Cloud sessions can't push tags, so run this once from a machine that can:

```sh
for r in dom-virus dom-battlefield sherman-bytes byte-runner swarm-protocol null-invaders; do
  sha=$(node -p "require('./docs/engine/baseline/versions.json').commits['$r']")
  git clone -q https://github.com/coded-dot-design/$r /tmp/eb-$r && (cd /tmp/eb-$r &&
    git tag -a engine-baseline "$sha" -m "Engine E0 baseline"
    git tag -a phase-1 "$sha" -m "Phase 1 go-live" 2>/dev/null  # skipped if already tagged
    git push origin engine-baseline phase-1)
done
```
