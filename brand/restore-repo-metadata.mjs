#!/usr/bin/env node
/**
 * Restore GitHub repo description / homepage / topics from the pre-rollout snapshot.
 *
 * Repo description, homepage and topics are NOT versioned by git and GitHub keeps
 * no history for them. `repo-metadata.before.json` is the only way back, so this
 * script is the entire rollback story for that surface.
 *
 *   node restore-repo-metadata.mjs --dry-run              # print the plan, touch nothing
 *   node restore-repo-metadata.mjs --repo renovate-config # restore exactly one repo
 *   node restore-repo-metadata.mjs --yes                  # restore every drifted repo
 *
 * `gh repo edit` has no "replace all topics" — it only adds and removes — so topics
 * are reconciled as a set difference against whatever is live right now.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = join(HERE, "repo-metadata.before.json");
const ORG = "BlockRunAI";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const confirmed = argv.includes("--yes");
const only = argv.includes("--repo") ? argv[argv.indexOf("--repo") + 1] : null;

if (!dryRun && !confirmed && !only) {
  console.error("Refusing to write without --yes (or --repo <name>). Use --dry-run to preview.");
  process.exit(2);
}

const gh = (args) => execFileSync("gh", args, { encoding: "utf8" });

const topicsOf = (repo) =>
  new Set((repo.repositoryTopics ?? []).map((t) => (typeof t === "string" ? t : t.name)));

/** Snapshot: what the metadata looked like before the brand rollout. */
const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")).filter(
  (r) => r.visibility === "PUBLIC" && (!only || r.name === only),
);

if (only && snapshot.length === 0) {
  console.error(`${only} is not a public repo in the snapshot.`);
  process.exit(2);
}

/** Live: what it looks like right now. Fetched fresh so a partial restore is resumable. */
const live = new Map(
  JSON.parse(
    gh(["repo", "list", ORG, "--limit", "200", "--json",
        "name,description,repositoryTopics,homepageUrl,visibility,isArchived"]),
  ).map((r) => [r.name, r]),
);

let restored = 0;
let clean = 0;
const skipped = [];

for (const want of snapshot) {
  const now = live.get(want.name);
  if (!now) {
    skipped.push(`${want.name} — no longer exists`);
    continue;
  }
  // An archived repo rejects every `gh repo edit` write. Surfacing it is the point:
  // silently skipping would report a successful restore that never happened.
  if (now.isArchived) {
    skipped.push(`${want.name} — archived, must be unarchived before it accepts edits`);
    continue;
  }

  const args = ["repo", "edit", `${ORG}/${want.name}`];
  const changes = [];

  if ((now.description ?? "") !== (want.description ?? "")) {
    args.push("--description", want.description ?? "");
    changes.push(`description: ${JSON.stringify(now.description ?? "")} -> ${JSON.stringify(want.description ?? "")}`);
  }
  if ((now.homepageUrl ?? "") !== (want.homepageUrl ?? "")) {
    args.push("--homepage", want.homepageUrl ?? "");
    changes.push(`homepage: ${JSON.stringify(now.homepageUrl ?? "")} -> ${JSON.stringify(want.homepageUrl ?? "")}`);
  }

  // Set difference in both directions — `gh repo edit` cannot replace the topic list.
  const wantTopics = topicsOf(want);
  const nowTopics = topicsOf(now);
  const toAdd = [...wantTopics].filter((t) => !nowTopics.has(t));
  const toRemove = [...nowTopics].filter((t) => !wantTopics.has(t));
  for (const t of toAdd) args.push("--add-topic", t);
  for (const t of toRemove) args.push("--remove-topic", t);
  if (toAdd.length) changes.push(`+topics: ${toAdd.join(", ")}`);
  if (toRemove.length) changes.push(`-topics: ${toRemove.join(", ")}`);

  if (changes.length === 0) {
    clean++;
    continue;
  }

  console.log(`\n${want.name}`);
  for (const c of changes) console.log(`  ${c}`);

  if (dryRun) continue;
  gh(args);
  console.log("  restored");
  restored++;
}

console.log(
  `\n${dryRun ? "would restore" : "restored"}: ${dryRun ? snapshot.length - clean - skipped.length : restored}` +
    ` | already matching: ${clean} | skipped: ${skipped.length}`,
);
for (const s of skipped) console.log(`  skipped ${s}`);
