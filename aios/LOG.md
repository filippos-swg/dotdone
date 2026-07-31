# DotDone — Decision & Change Log

**Vocabulary.** An entry with a `**Status:**` is a decision. An entry without one is a change.
`APPROVED` — Filippos has signed it · `RECOMMENDED` — awaiting his pass / adjust / kill · `OPEN` — undecided, needs work · `SUPERSEDED` — replaced, with a pointer to what replaced it.

Newest first. Append only — never rewrite an entry. A correction is a new entry that supersedes the old one.

---

## 2026-07-31 — Migrated to AiOS v2.0
**Status:** RECOMMENDED
**Decision:** `Profile: build`, `Visibility: public`. `PROJECT_CANON.md` becomes `aios/CANON.md` and absorbs the brief's durable half — audience, problem, scope boundary, standing constraints, standing risks. `DECISIONS.md` and `CHANGELOG.md` merge into this file verbatim, newest first. `AI_HANDOFF.md` is **deleted**, replaced by generated `aios/STATE.md`.
**Evidence:** the handoff's own header said *"Active phase: v1.0 LIVE. v1.1 build running"* and *"Active task: TASK_002"* — hand-written on 2026-07-18 and never touched since. Every fact in it is now derived: HEAD and branch from git, unpushed work from `rev-list`, the active task and its tick count from `aios/tasks/`, staleness per file from `log -1`. **`Visibility: public` is the load-bearing new declaration** — this repo is publicly readable, verified live, and nothing but a declared line tells a session that.
**Dropped, deliberately:** the brief's "Build Readiness" and "Recommended Next Step" sections. Both are time-varying, both were 13 days stale, and both are what `STATE.md` derives. **That is the whole trade: two hand-maintained fields for one generated file that cannot go stale without saying so.**
**Found by the migration, not by anyone:** `aios check` `T1` reported TASK_001 as **8 of 8 ticked and still sitting in `aios/tasks/`**. The commit `8a6ffc2` on 2026-07-18 says *"TASK_001 done: device-tested"* — the work closed thirteen days ago, the file never moved, and the handoff went on naming TASK_002 as active while the filesystem still showed two open tasks. `git mv` to `tasks/done/` as close step 2. **This is the check earning its place on the first real repo it ran against.**

**Practical consequence:** four v1.3 files become two authored plus one generated. TASK_001 moves to `tasks/done/`; the other three are unchanged.

## 2026-07-18 — v1.2/v1.3 roadmap: reminders → export → widget
**Status:** APPROVED

**Decision:**
After v1.1 (TASK_001), the roadmap is: opt-in daily reminders per task (TASK_002), JSON export via share sheet (TASK_003), then iOS home-screen widget (TASK_004, blocked until v1.1 ships and v1.0 clears Apple review).

**Why:**
Reminders serve the core medication use case — a log you forget to open doesn't close the memory gap. Export insures local-only data against device loss at near-zero UI cost. The widget is the strongest expression of one-tap logging but the biggest lift (native WidgetKit target, App Group storage migration), so it goes last.

**Alternatives considered:**
Streak counters, weekly summaries, notes on dots — rejected. Each is the first step toward the generic habit app the canon forbids.

**Practical consequence:**
Task files TASK_002–004 created. Sequence is fixed; do not reorder without a new decision entry.

---

## 2026-07-18 — v1.1 scope: calendar quick-dot with backfill
**Status:** APPROVED

**Decision:**
v1.1 adds dot creation directly on the Calendar screen, reusing the existing task palette. The dot is logged to the currently selected day — which means past days can be backfilled.

**Why:**
Current flow forces a return to Home to log a dot, breaking the review-then-log loop. Backfill falls out of the same mechanic for free and fixes "I forgot to log yesterday."

**Alternatives considered:**
Separate "add" screen — rejected, violates one-gesture principle. Home-only logging kept pure — rejected, the calendar is where the memory gap is noticed.

**Practical consequence:**
Calendar gets an add affordance (+ button, same View-based cross as TasksScreen). Backdated entries need a timestamp convention — see OPEN decision below.

---

## 2026-07-18 — Timestamp convention for backfilled dots: "ADDED LATER"
**Status:** APPROVED

**Decision:**
Backfilled dots display "ADDED LATER" instead of a time. `timestamp` stores the true creation moment; the display layer shows the label whenever the timestamp's local date differs from `entry.date`. No schema change, backward compatible.

**Alternatives considered:**
Fake noon convention or creation-time display — both corrupt the only metadata a dot has. Time picker for backfill — rejected as friction for fake precision.

**Practical consequence:**
The log stays honest: real times are always real, reconstructed entries are visibly reconstructed. No ability to backfill with a specific time — deliberate.

---

## 2026-07-18 — Repo consolidation (RESOLVED same day)
**Status:** APPROVED

**Decision:**
All app work committed, remote history merged in (no force push — GitHub Pages files kept at root so App Store URLs stayed live), pushed to `filippos-swg/dotdone`. Folder moved from `~/dotdone` to `~/Documents/Projects/dotdone` per AIOS structure. Two redundant stub copies archived to `~/Documents/Archive/` (dotdone-github-stub, dotdone-github-stub-claude-copy). GitHub Desktop repointed to the new path.

**Why:**
The shipped app existed only on one laptop — single point of failure, violated AIOS "GitHub is the source of truth."

**Practical consequence:**
Canonical repo: `~/Documents/Projects/dotdone` ↔ `filippos-swg/dotdone`. DotDone is GREEN.

---

## 2026-07-18 — Task palette already exists; problem is discoverability
**Status:** APPROVED (as a finding)

**Decision:**
Colored, named dots shipped in v1.0 (hold on Home → palette; MY TASKS manages tasks). The owner's request to "add colors and names to dots" revealed the feature is invisible. v1.1 treats this as a discoverability problem, not a missing feature.

**Practical consequence:**
Calendar quick-dot surfaces the palette in a second, visible location. No new onboarding screens — canon forbids clutter; visibility comes from the + affordance itself.

---

### 2026-05 — Tasks system added for App Store resubmission (historical)


**Status:** APPROVED

**Decision:**
To answer Apple Guideline 4.2 (minimum functionality), v1.0 added the tasks system: 36-color transit palette, named tasks, hold-to-choose on Home, colored dots on Calendar. Support URL fixed for Guideline 1.5 (`filippos-swg.github.io/dotdone/support.html`).

**Practical consequence:**
Resubmitted; in review as of July 2026. Full recap: `assets/appstore/resubmission-v2-recap.md`.

---

### 2026-05 — Storage: expo-file-system/legacy JSON, not AsyncStorage (historical)


**Status:** APPROVED

**Decision:**
All persistence is JSON files via expo-file-system/legacy (`dotdone_entries.json`, `dotdone_tasks.json` in documentDirectory).

**Why:**
AsyncStorage v3 threw "Native module is null" under Expo Go new-arch. File-based JSON is dependency-light and debuggable.

**Practical consequence:**
Any schema change must read old JSON gracefully (see `resolveColor()` normalising legacy `'black'`).

---

*Add new decisions above this line. Most recent first.*

## 2026-07-18 — v1.0 APPROVED AND LIVE on the App Store
### Notes
Apple approved the resubmission. Both rejection grounds (4.2 minimum functionality, 1.5 support URL) cleared. DotDone is publicly available.

### Updated
- `app.json` — version bumped to 1.1.0 for the calendar quick-dot release
- `assets/appstore/release-notes-1.1.md` — What's New text and submission steps

---

## 2026-07-18 — TASK_001 closed: device test passed
### Notes
Owner tested on device: calendar + button, palette, dot on selected day, backfill on past day with ADDED LATER label, Home tap/hold unchanged. v1.1 feature set is code-complete. Release held until Apple decides on v1.0 (see AI_HANDOFF release strategy).

---

## 2026-07-18 — TASK_001 built: calendar quick-dot with backfill
### Added
- `src/components/TaskPalette.tsx` — palette extracted from HomeScreen into shared component
- CalendarScreen: centered + button in footer (HOME | + | MY TASKS, three flex:1 slots); opens palette; dot saved to the currently selected day, in-place refresh
- Backfill display: dots whose creation date differs from their day show "ADDED LATER" instead of a time (DECISIONS 2026-07-18)

### Updated
- HomeScreen — refactored to use shared TaskPalette; tap/hold behavior unchanged

### Notes
Awaiting device test. Found during build: node_modules was pruned (~393/774 packages) and expo-font / expo-file-system / @expo/vector-icons are only transitive deps — owner to run `npm install` + `npx expo install expo-font expo-file-system @expo/vector-icons`.

---

## 2026-07-18 — Roadmap tasks created (TASK_002–004)
### Added
- `aios/tasks/TASK_002.md` — opt-in daily reminders per task (v1.2)
- `aios/tasks/TASK_003.md` — JSON export via share sheet (v1.2)
- `aios/tasks/TASK_004.md` — iOS home-screen widget (v1.3, blocked until v1.1 ships)
- DECISIONS: roadmap sequence approved; streaks/stats/notes explicitly rejected per canon

---

## 2026-07-18 — Repo consolidated and moved to Projects/
### Updated
- Repo — all v1.0 work committed and pushed to `filippos-swg/dotdone`; remote Pages files (privacy.html, support.html) merged to root, App Store URLs unaffected
- Location — moved `~/dotdone` → `~/Documents/Projects/dotdone` per AIOS workspace structure

### Removed
- Stub clones at `~/Documents/Projects/dotdone` (old) and `~/Documents/Claude/projects/seriously wow/dotdone` — archived to `~/Documents/Archive/`

---

## 2026-07-18 — AIOS v1 structure created
### Added
- `aios/` — full AIOS v1 layer: AI_HANDOFF, PROJECT_BRIEF, PROJECT_CANON, DECISIONS, CHANGELOG, tasks/TASK_001
- `aios/tasks/TASK_001.md` — v1.1 scope: calendar quick-dot with backfill

### Notes
App is in Apple review (v1.0 resubmission). Repo consolidation pending — see OPEN decision in DECISIONS.md.

---

## 2026-07 — v1.0 resubmitted to Apple

### Updated
- App Store Connect — support URL fixed (Guideline 1.5), reviewer notes added explaining medication/habit tracking intent
- EAS build auto-incremented, submitted via `eas submit --latest`

### Notes
Status: Ready for Review. Full recap in `assets/appstore/resubmission-v2-recap.md`.

---

## 2026-05/06 — Tasks system built (Guideline 4.2 response)

### Added
- `src/screens/TasksScreen.tsx` — task CRUD, 36-color picker, reordering
- `src/utils/colors.ts` — TASK_COLORS transit palette
- `src/storage/tasks.ts` — task persistence (expo-file-system/legacy JSON)
- Home: hold-to-choose task palette (bottom sheet modal)
- Calendar: colored dot bullets, task name labels, per-day dot indicators
- `assets/appstore/support.html` — support page for GitHub Pages

### Updated
- `src/types/index.ts` — DotTask type, DotEntry gains color/taskId
- TasksScreen footer — three flex:1 slots so + button sits at exact screen center; View-based plus cross (NDot47 metrics unreliable)

---

## 2026-05 — v1.0 core app

### Added
- Home (tap-to-dot), Calendar (week/month, delete via long press), storage layer
- NDot47 font via Font.loadAsync; expo-file-system/legacy JSON storage

### Notes
Key constraints discovered: no AsyncStorage (native module null), no useFonts hook (Fabric crash), no flex:1 on Text (RN 0.81).

---

*Add new entries above this line.*

