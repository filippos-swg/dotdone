# Decisions

Strategic, creative, product, technical, and scope decisions.
Not meeting notes. Decisions only. Most recent first.

**Status key:**
- **APPROVED** — confirmed by owner
- **RECOMMENDED** — internal direction, not yet confirmed
- **OPEN** — requires a decision before work can proceed
- **SUPERSEDED** — replaced by a later decision (keep for history)

---

## Decision Log

### 2026-07-18 — v1.2/v1.3 roadmap: reminders → export → widget

**Owner:** Filippos
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

### 2026-07-18 — v1.1 scope: calendar quick-dot with backfill

**Owner:** Filippos
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

### 2026-07-18 — Timestamp convention for backfilled dots: "ADDED LATER"

**Owner:** Filippos
**Status:** APPROVED

**Decision:**
Backfilled dots display "ADDED LATER" instead of a time. `timestamp` stores the true creation moment; the display layer shows the label whenever the timestamp's local date differs from `entry.date`. No schema change, backward compatible.

**Alternatives considered:**
Fake noon convention or creation-time display — both corrupt the only metadata a dot has. Time picker for backfill — rejected as friction for fake precision.

**Practical consequence:**
The log stays honest: real times are always real, reconstructed entries are visibly reconstructed. No ability to backfill with a specific time — deliberate.

---

### 2026-07-18 — Repo consolidation (RESOLVED same day)

**Owner:** Filippos
**Status:** APPROVED

**Decision:**
All app work committed, remote history merged in (no force push — GitHub Pages files kept at root so App Store URLs stayed live), pushed to `filippos-swg/dotdone`. Folder moved from `~/dotdone` to `~/Documents/Projects/dotdone` per AIOS structure. Two redundant stub copies archived to `~/Documents/Archive/` (dotdone-github-stub, dotdone-github-stub-claude-copy). GitHub Desktop repointed to the new path.

**Why:**
The shipped app existed only on one laptop — single point of failure, violated AIOS "GitHub is the source of truth."

**Practical consequence:**
Canonical repo: `~/Documents/Projects/dotdone` ↔ `filippos-swg/dotdone`. DotDone is GREEN.

---

### 2026-07-18 — Task palette already exists; problem is discoverability

**Owner:** Filippos / session finding
**Status:** APPROVED (as a finding)

**Decision:**
Colored, named dots shipped in v1.0 (hold on Home → palette; MY TASKS manages tasks). The owner's request to "add colors and names to dots" revealed the feature is invisible. v1.1 treats this as a discoverability problem, not a missing feature.

**Practical consequence:**
Calendar quick-dot surfaces the palette in a second, visible location. No new onboarding screens — canon forbids clutter; visibility comes from the + affordance itself.

---

### 2026-05 — Tasks system added for App Store resubmission (historical)

**Owner:** Filippos
**Status:** APPROVED

**Decision:**
To answer Apple Guideline 4.2 (minimum functionality), v1.0 added the tasks system: 36-color transit palette, named tasks, hold-to-choose on Home, colored dots on Calendar. Support URL fixed for Guideline 1.5 (`filippos-swg.github.io/dotdone/support.html`).

**Practical consequence:**
Resubmitted; in review as of July 2026. Full recap: `assets/appstore/resubmission-v2-recap.md`.

---

### 2026-05 — Storage: expo-file-system/legacy JSON, not AsyncStorage (historical)

**Owner:** Filippos
**Status:** APPROVED

**Decision:**
All persistence is JSON files via expo-file-system/legacy (`dotdone_entries.json`, `dotdone_tasks.json` in documentDirectory).

**Why:**
AsyncStorage v3 threw "Native module is null" under Expo Go new-arch. File-based JSON is dependency-light and debuggable.

**Practical consequence:**
Any schema change must read old JSON gracefully (see `resolveColor()` normalising legacy `'black'`).

---

*Add new decisions above this line. Most recent first.*
