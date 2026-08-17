<!-- GENERATED — do not edit. Edits are overwritten at next close. -->
Generated 2026-08-17 15:00 +0000 · HEAD 89bc3ca · branch main · host claude · generator v2.0 · PARTIAL
STALENESS RULE: if `git rev-parse HEAD` ≠ 89bc3ca, or the tree is dirty, this file is HISTORY. Regenerate before acting on it.

> **PARTIAL.** At least one git-derived section could not run. This surface may ground a read-only session and **may never ground a close.** The gaps are in §11.

## 1 · Identity
<sub>CLAUDE.md, the five human lines — the only human input in this file</sub>

- **Repo:** dotdone
- **Profile:** build
- **Visibility:** public
- **Standard:** AiOS v2.0
- **Depends on:** nothing

## 2 · Head
<sub>git rev-parse HEAD · git log -1 · git rev-list --left-right --count @{u}...HEAD</sub>

> **As of `89bc3ca`.** The close commits this file after generating it, so the counts below are one commit old the moment they land. Re-run `aios-state` for current numbers.

- **main @ 89bc3ca** — close: delete the close ledger
- Committed 2026-07-31 15:08 by Filippos Arvanitakis
- Upstream: origin/main · **0 ahead**, 0 behind

## 3 · Working tree
<sub>git status --porcelain + a filesystem diff against git ls-files</sub>

> **As of `89bc3ca`, before this file was committed.** `aios/STATE.md` and `aios/CLOSING` appear here for that reason and are not real dirt.

- **1 modified:** `assets/appstore/release-notes-1.1.md`

## 4 · Local-only branches
<sub>git for-each-ref refs/heads, where %(upstream) is empty</sub>

- None. Every branch has an upstream.

## 5 · Since last close
<sub>git log 1cb693d..HEAD</sub>

- `89bc3ca` 2026-07-31 — close: delete the close ledger
- `d056cf4` 2026-07-31 — close: commit the state surface, ledger fully ticked

Close marker: 89bc3ca4584b84766e21b12472f08a699a54a021

## 6 · Awaiting judgment
<sub>aios/LOG.md headings + **Status:** lines — headings, dates and statuses only, never bodies</sub>

- **RECOMMENDED** · 2026-07-31 (17d) — Repairing what the migration broke, and recovering what it deleted
- **RECOMMENDED** · 2026-07-31 (17d) — Migrated to AiOS v2.0

## 7 · Active tasks
<sub>aios/tasks/* + git log -1 -- <file></sub>

- `TASK_002.md` — Not started (sequenced after TASK_001) · **0/7 ticked** · last touched 17d ago
- `TASK_003.md` — Not started (sequenced after TASK_002) · **0/6 ticked** · last touched 17d ago
- `TASK_004.md` — Not started — BLOCKED until v1.1 ships and v1.0 passes Apple · **0/6 ticked** · last touched 17d ago

## 8 · Staleness
<sub>git log -1 --format=%ad -- <path>, worst 10</sub>

- `assets/appstore/eas-build-guide.md` — 30d old, **13d behind** the newest commit in the repo
- `assets/appstore/metadata.md` — 30d old, **13d behind** the newest commit in the repo
- `assets/appstore/resubmission-v2-recap.md` — 30d old, **13d behind** the newest commit in the repo
- `assets/appstore/release-notes-1.1.md` — 30d old, **13d behind** the newest commit in the repo
- `CLAUDE.md` — 17d old, **0d behind** the newest commit in the repo
- `aios/tasks/done/TASK_001.md` — 17d old, **0d behind** the newest commit in the repo
- `aios/CANON.md` — 17d old, **0d behind** the newest commit in the repo
- `aios/LOG.md` — 17d old, **0d behind** the newest commit in the repo
- `aios/tasks/TASK_002.md` — 17d old, **0d behind** the newest commit in the repo
- `aios/tasks/TASK_003.md` — 17d old, **0d behind** the newest commit in the repo

## 9 · Cross-repo pins
<sub>CLAUDE.md `Depends on:` (human) + the sibling's own git</sub>

- No declared dependencies.

## 10 · Operator runs

- Not an operator profile.

## 11 · Could not determine
<sub>the generator's own error list</sub>

- §6 — LOG.md:201 heading carries no parseable date: "2026-07 — v1.0 resubmitted to Apple"
- §6 — LOG.md:212 heading carries no parseable date: "2026-05/06 — Tasks system built (Guideline 4.2 response)"
- §6 — LOG.md:228 heading carries no parseable date: "2026-05 — v1.0 core app"
- **§3 — the tree is dirty: 1 path(s) uncommitted, so nothing in this surface describes them. The record here describes code committed nowhere.**

---
<sub>Generated on claude by `/sessions/rcw-01lfupywgxtjzxgydnq3vab8/mnt/Projects/AIOS/Framework/project-aios/bin/aios-state.mjs` v2.0, against /sessions/rcw-01lfupywgxtjzxgydnq3vab8/mnt/Projects/dotdone. Regenerate with `node <that path> .` from the repo root. A hand edit is check failure S1.</sub>
