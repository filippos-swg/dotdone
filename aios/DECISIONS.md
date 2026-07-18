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

### 2026-07-18 — Timestamp convention for backfilled dots

**Owner:** Filippos
**Status:** OPEN

**Decision needed:**
When a dot is added to a past day, what timestamp does it get? Options: (a) actual creation time with the past date — calendar would show a misleading time-of-day; (b) a neutral marker (e.g. no time shown, dot displays as "ADDED LATER"); (c) 12:00 noon convention.

**Why it matters:**
The time label is the only metadata a dot has. A false time undermines the log's trustworthiness — the core value.

---

### 2026-07-18 — Repo consolidation

**Owner:** Filippos
**Status:** OPEN

**Decision needed:**
`~/dotdone` holds the real app but has one stale commit and no remote. `filippos-swg/dotdone` on GitHub holds only privacy.html + support.html (via `~/Documents/Projects/dotdone` stub). Proposed: commit all work in `~/dotdone`, point it at `filippos-swg/dotdone`, force-push as canonical, retire the stub, later move folder to `~/Documents/Projects/dotdone`.

**Why it matters:**
The shipped app currently exists only on one laptop. Single point of failure. Violates AIOS "GitHub is the source of truth."

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
