#!/usr/bin/env node
/**
 * Propose GitHub repo description / homepage / topics changes.
 *
 * Repo metadata is the one marketing surface with no file behind it: git does
 * not version it, markers cannot reach it, and it is what shows on the repo
 * card, in GitHub search and in the org listing. It drifts silently and stays
 * drifted, which is why 7 descriptions still advertised 41+ or 55+ models
 * against a catalog of 66.
 *
 *   node brand/plan-repo-metadata.mjs             print the plan, touch nothing
 *   node brand/plan-repo-metadata.mjs --apply     write it
 *   node brand/plan-repo-metadata.mjs --only numbers   restrict to number fixes
 *
 * Rollback is restore-repo-metadata.mjs, against repo-metadata.before.json.
 *
 * DESIGN: this NEVER writes prose it invented. A description is only ever
 * edited by substituting a stale number for the published one — the sentence
 * stays as whoever wrote it left it. Topics and homepage are proposed, because
 * those are structured discoverability data rather than claims, and a proposal
 * you can read beats a blank field on 29 of 37 repos.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ORG = "BlockRunAI";
const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

const gh = (args) => execFileSync("gh", args, { encoding: "utf8" });
const N = JSON.parse(readFileSync(join(HERE, "..", "brand-numbers.json"), "utf8"));

/**
 * A number in a description that must equal a published value.
 *
 * Deliberately narrow: only the claim vocabulary this artifact owns. "3 tools"
 * in a repo that ships three tools is not ours to touch, so nothing here
 * matches a bare count without one of these words after it.
 */
const NUMBER_RULES = [
  [/(?<![\d.])\d{2,3}\+? (AI |chat |LLM )?models\b/g, N.models.chatVisible, "models"],
  [/(?<![\d.])\d{2,3}\+? (AI |chat |LLM )?LLMs\b/g, N.models.chatVisible, "LLMs"],
  [/(?<![\d.])\d{2,3}\+? chains\b/g, N.chains.rpc, "chains"],
];

/**
 * Repos whose shape does not predict their subject. Shape says "how it ships",
 * not "what it is about", and for a few that gap is total — renovate-config is
 * `md` like the x402 docs repos are `md`, and tagging it x402/usdc would be
 * wrong in a way a reader would notice. Caught by reading the dry run.
 */
const TOPIC_OVERRIDES = {
  "renovate-config": ["renovate", "dependencies"],
  branding: ["branding"],
};

/** Topics proposed per shape. Structured data, not claims. */
const TOPICS_BY_SHAPE = {
  "ts-npm": ["typescript", "x402", "usdc", "ai-agents"],
  "py-pypi": ["python", "x402", "usdc", "ai-agents"],
  py: ["python", "x402", "usdc"],
  go: ["golang", "x402", "usdc", "ai-agents"],
  md: ["x402", "usdc"],
  awesome: ["awesome-list", "mcp"],
  brand: ["branding"],
  profile: [],
  archive: [],
};

const repos = JSON.parse(readFileSync(join(HERE, "..", "..", "brand", "repos.json"), "utf8")).repos;
const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

const live = JSON.parse(
  gh([
    "repo", "list", ORG, "--limit", "200", "--json",
    "name,description,repositoryTopics,homepageUrl,visibility,isArchived",
  ]),
).filter((r) => r.visibility === "PUBLIC" && !r.isArchived);

const topicsOf = (r) =>
  new Set((r.repositoryTopics ?? []).map((t) => (typeof t === "string" ? t : t.name)));

let numberFixes = 0, topicAdds = 0, homepageAdds = 0, clean = 0;

for (const repo of live.sort((a, b) => a.name.localeCompare(b.name))) {
  const spec = byName.get(repo.name.toLowerCase());
  const changes = [];
  const args = ["repo", "edit", `${ORG}/${repo.name}`];

  // ── 1. Numbers. Substitution only — the prose is left as written. ────────
  let desc = repo.description ?? "";
  const before = desc;
  for (const [re, value, word] of NUMBER_RULES) {
    desc = desc.replace(re, (m) => {
      const qualifier = m.match(/(AI |chat |LLM )/)?.[0] ?? "";
      return `${value} ${qualifier}${word}`;
    });
  }
  if (desc !== before) {
    changes.push({ kind: "numbers", text: `description: ${JSON.stringify(before)}\n              -> ${JSON.stringify(desc)}` });
    args.push("--description", desc);
    numberFixes++;
  }

  if (only !== "numbers") {
    // ── 2. Topics — additive only. Never remove what a human chose. ────────
    const want = TOPIC_OVERRIDES[repo.name] ?? TOPICS_BY_SHAPE[spec?.shape] ?? [];
    const now = topicsOf(repo);
    const add = want.filter((t) => !now.has(t));
    if (add.length && now.size === 0) {
      changes.push({ kind: "topics", text: `topics: +${add.join(", ")}` });
      for (const t of add) args.push("--add-topic", t);
      topicAdds++;
    }

    // ── 3. Homepage — only where repos.json states one. Never guessed. ─────
    if (spec?.homepageUrl && !repo.homepageUrl) {
      changes.push({ kind: "homepage", text: `homepage: -> ${spec.homepageUrl}` });
      args.push("--homepage", spec.homepageUrl);
      homepageAdds++;
    }
  }

  if (!changes.length) { clean++; continue; }
  console.log(`\n${repo.name}${spec ? "" : "   (not in repos.json)"}`);
  for (const c of changes) console.log(`  ${c.text}`);
  if (apply) { gh(args); console.log("  applied"); }
}

console.log(
  `\n${apply ? "applied" : "would change"}: ${numberFixes} description(s), ` +
    `${topicAdds} topic set(s), ${homepageAdds} homepage(s) | already clean: ${clean}`,
);
if (!apply) console.log("\nnothing was written. re-run with --apply to write.");
