<!-- GENERATED — do not edit. Edits are overwritten at next close. -->
Generated 2026-10-07 09:16 +0200 · HEAD afbe1e3 · branch feature/dot-it-v2 · host Souths-MacBook-Air.local · generator v2.0 · PARTIAL
STALENESS RULE: if `git rev-parse HEAD` ≠ afbe1e3, or the tree is dirty, this file is HISTORY. Regenerate before acting on it.

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

> **As of `afbe1e3`.** The close commits this file after generating it, so the counts below are one commit old the moment they land. Re-run `aios-state` for current numbers.

- **feature/dot-it-v2 @ afbe1e3** — feat: JSON export via share sheet (TASK_003)
- Committed 2026-09-08 18:29 by Filippos Arvanitakis
- Upstream: **none configured**

## 3 · Working tree
<sub>git status --porcelain + a filesystem diff against git ls-files</sub>

> **As of `afbe1e3`, before this file was committed.** `aios/STATE.md` and `aios/CLOSING` appear here for that reason and are not real dirt.

- **22 modified:** `App.tsx`, `CLAUDE.md`, `aios/CANON.md`, `aios/LOG.md`, `aios/STATE.md`, `aios/tasks/TASK_002.md`, `aios/tasks/TASK_003.md`, `aios/tasks/TASK_004.md` …+14
- **5 untracked:** `assets/appstore/release-plan-2.0.md`, `src/storage/entryMerge.ts`, `src/storage/widgetShared.ts`, `targets/`, `tests/`

## 4 · Local-only branches
<sub>git for-each-ref refs/heads, where %(upstream) is empty</sub>

- `feature/dot-it-v2` — last commit 2026-09-08, **no upstream, exists nowhere else**
- `task/002-daily-reminders` — last commit 2026-09-08, **no upstream, exists nowhere else**
- `task/003-data-export` — last commit 2026-09-08, **no upstream, exists nowhere else**

## 5 · Since last close
<sub>git log afbe1e3..HEAD</sub>

- Nothing since `afbe1e3`.

Close marker: afbe1e312924bc1358e65242d1c0844fcb2be922

## 6 · Awaiting judgment
<sub>aios/LOG.md headings + **Status:** lines — headings, dates and statuses only, never bodies</sub>

- **RECOMMENDED** · 2026-07-31 (68d) — Repairing what the migration broke, and recovering what it deleted
- **RECOMMENDED** · 2026-07-31 (68d) — Migrated to AiOS v2.0

## 7 · Active tasks
<sub>aios/tasks/* + git log -1 -- <file></sub>

- `TASK_002.md` — Implemented on feature/dot-it-v2; device verification pendin · **3/7 ticked** · last touched 67d ago
- `TASK_003.md` — Implemented on feature/dot-it-v2; device verification pendin · **2/6 ticked** · last touched 67d ago
- `TASK_004.md` — Implementation in progress; native build blocked on widget p · **0/6 ticked** · last touched 67d ago

## 8 · Staleness
<sub>git log -1 --format=%ad -- <path>, worst 10</sub>

- `assets/appstore/eas-build-guide.md` — 81d old, **52d behind** the newest commit in the repo
- `assets/appstore/metadata.md` — 81d old, **52d behind** the newest commit in the repo
- `assets/appstore/resubmission-v2-recap.md` — 81d old, **52d behind** the newest commit in the repo
- `aios/tasks/done/TASK_001.md` — 67d old, **39d behind** the newest commit in the repo
- `aios/CANON.md` — 67d old, **39d behind** the newest commit in the repo
- `aios/LOG.md` — 67d old, **39d behind** the newest commit in the repo
- `aios/tasks/TASK_002.md` — 67d old, **39d behind** the newest commit in the repo
- `aios/tasks/TASK_003.md` — 67d old, **39d behind** the newest commit in the repo
- `aios/tasks/TASK_004.md` — 67d old, **39d behind** the newest commit in the repo
- `assets/appstore/release-notes-1.1.md` — 50d old, **21d behind** the newest commit in the repo

## 9 · Cross-repo pins
<sub>CLAUDE.md `Depends on:` (human) + the sibling's own git</sub>

- No declared dependencies.

## 10 · Operator runs

- Not an operator profile.

## 11 · Could not determine
<sub>the generator's own error list</sub>

- §2 — branch feature/dot-it-v2 has no upstream configured — ahead/behind cannot be computed
- §6 — LOG.md:211 heading carries no parseable date: "2026-07 — v1.0 resubmitted to Apple"
- §6 — LOG.md:222 heading carries no parseable date: "2026-05/06 — Tasks system built (Guideline 4.2 response)"
- §6 — LOG.md:238 heading carries no parseable date: "2026-05 — v1.0 core app"
- **§3 — the tree is dirty: 26 path(s) uncommitted, so nothing in this surface describes them. The record here describes code committed nowhere.**

---
<sub>Generated on Souths-MacBook-Air.local by `/Users/southnorthflip/Projects/AIOS/Framework/project-aios/bin/aios-state.mjs` v2.0, against /Users/southnorthflip/Projects/dotdone. Regenerate with `node <that path> .` from the repo root. A hand edit is check failure S1.</sub>
