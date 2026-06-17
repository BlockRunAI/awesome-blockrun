# Docs authoring guide

How to write BlockRun docs pages so they render with the Greptile-style
components on blockrun.ai/docs. Pages are plain Markdown (`.md`) in `docs/`,
listed in `SUMMARY.md`, and rendered by the Next.js docs route.

## Frontmatter (every page)

Start each page with YAML frontmatter:

```yaml
---
title: 5-Minute Quickstart
description: One sentence (≤155 chars) used for the page <meta> description, social cards, and search.
---
```

- `title` — overrides the `# H1` for the browser tab / search. Keep the `# H1` too.
- `description` — required. This is the single most important SEO + search field.

## Page anatomy (follow this order)

1. `# Title` then a **one-sentence** statement of what the page is.
2. A `:::note`/`:::tip` "what you need" or "in a hurry" callout when useful.
3. Body, shortest-path-first. Lead with the common case; defer edge cases.
4. A **What's next?** `::::cards` block linking 2–3 logical next pages.

## Components (`:::` directives)

**Nesting rule:** the outer fence must have **more colons** than what it
contains. Callouts are 3 colons, so a `::::cards`/`::::steps` wrapper uses 4. If
you nest a callout *inside* a step, bump the wrappers to 5/4. Easiest path:
**don't nest directives** — keep callouts at the top level.

### Callouts

```
:::note{title="Optional title"}
Body markdown.
:::
```

Kinds: `note` / `info` (blue), `tip` (green), `warning` (amber), `danger` (red).

### Cards (role entry points, "what's next")

```
::::cards
:::card{title="I use Claude Code" href="getting-started/quickstart.md" icon="Terminal"}
Short description.
:::
::::
```

- `href` — internal `.md` path (routed through `/docs`), a site path (`/x`), or external URL.
- `icon` — a name from the curated set: `Rocket, Code, Wallet, Brain, Image, TrendingUp, Route, Boxes, Search, Book, Terminal, Zap, ArrowRight`.
- Optional `{cols="3"}` on `::::cards` (default 2).

### Steps (sequential setup)

```
::::steps
:::step{title="Install"}
Body markdown, including code blocks.
:::
::::
```

### Tabs (parallel alternatives — languages, platforms)

```
::::tabs
:::tab{label="Python"}
```bash
pip install blockrun-llm
```
:::
::::
```

## Voice

Task-oriented, second person, present tense. Lead with the verb. State the
time/cost up front ("under five minutes", "a fraction of a cent"). Prefer a
short paragraph + a component over long prose — navigation and structure beat
volume.
