# brand/

Two unrelated things live here. Both exist because the surface they cover has no
history of its own.

## `repo-metadata.before.json` + `restore-repo-metadata.mjs`

GitHub repo **description, homepage and topics** are not versioned by git, and
GitHub keeps no history for them. The snapshot is the only way back, so the
restore script is the entire rollback story for that surface.

```bash
node brand/restore-repo-metadata.mjs --dry-run              # print the plan, touch nothing
node brand/restore-repo-metadata.mjs --repo renovate-config # restore exactly one repo
node brand/restore-repo-metadata.mjs --yes                  # restore every drifted repo
```

## The mirror is *not* here — it is `../brand-numbers.json`

Marketing numbers come from `https://blockrun.ai/brand/numbers.json`, which is
generated from the model catalog and cannot go stale.

This repo consumes that artifact exactly like every other public repo: one
`brand-numbers.json` at the root, markers in the docs, `scripts/sync-brand-numbers.mjs`
to rewrite them. The only thing special about **this** repo's snapshot is that
the other 36 point at it as their fallback when blockrun.ai is unreachable.

That is why the file sits at the root rather than in here: one file per repo,
one role, nothing to keep in step by hand.

```bash
node scripts/sync-brand-numbers.mjs           # rewrite markers from the snapshot
node scripts/sync-brand-numbers.mjs --check   # exit 1 on drift, never fetches (CI)
node scripts/sync-brand-numbers.mjs --refresh # pull a newer artifact, then rewrite
```

### `docs/` must NOT carry markers

An HTML comment is invisible only where something renders it as HTML. GitHub
does. **blockrun.ai does not** — `docs/` is symlinked into the blockrun repo and
served through its docs renderer, which escapes the comment and prints it:

```
JSON-RPC 2.0 access to <!-- br:chains.rpc -->40<!-- /br:chains.rpc --> blockchains
```

The same file therefore reads fine on GitHub and broken on the site. `docs/`
keeps plain numbers; blockrun asserts them in `brand-numbers.docs.test.ts` and
fails if a marker ever reappears there.

Markers are fine in `README.md` and `ECOSYSTEM.md` — those are only ever
rendered by GitHub.
