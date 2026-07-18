# AI Handoff

**Project:** DotDone
**Last updated:** 2026-07-18
**Active phase:** v1.0 LIVE. v1.1 build running on EAS — owner completes submission manually
**Paused:** 2026-07-18. Owner's remaining steps: (1) `eas submit --platform ios --latest` when build finishes, (2) create version 1.1.0 in App Store Connect, paste What's New from `assets/appstore/release-notes-1.1.md`, attach build, (3) Submit for Review
**Active task:** TASK_002 — Opt-in Daily Reminders (start next session)
**Status:** Ready

---

## Read First

Before working, read these files in order:

1. `aios/PROJECT_BRIEF.md`
2. `aios/PROJECT_CANON.md`
3. `aios/DECISIONS.md` — check APPROVED / RECOMMENDED / OPEN status on every entry
4. `aios/tasks/TASK_001.md` — the active task

---

## Current State

### What is locked

- Canon: one-tap logging, dot as the only unit, local-only data, NDot47 black-on-white aesthetic, no gamification/social/stats
- Storage: expo-file-system/legacy JSON (`dotdone_entries.json`, `dotdone_tasks.json`)
- Tasks system: 36-color transit palette, hold-on-Home palette, MY TASKS CRUD — shipped in v1.0
- v1.1 feature set: calendar quick-dot with backfill — DONE, device-tested (TASK_001)
- Roadmap: v1.2 reminders (TASK_002) + export (TASK_003), v1.3 widget (TASK_004)

### What is RECOMMENDED but not confirmed

- (nothing currently — roadmap through v1.3 is APPROVED, see DECISIONS 2026-07-18)

### What is OPEN

- v1.1 review outcome (submitted after v1.0 approval; version bumped to 1.1.0)

---

## What Must Not Be Touched

- Home tap/hold mechanic — behavior is final
- Storage file names and existing JSON shapes (read-compatibility required; see `resolveColor()` legacy handling)
- The canon boundaries in `PROJECT_CANON.md`

---

## Primary Intent

Get v1.0 approved and live, then ship v1.1: dot creation from the calendar (with backfill) to close the review-then-log loop. Keep the app aggressively minimal — every addition is tested against "does this survive the canon?"

---

## Strategic Risks

- Feature creep — the canon exists because "useful" additions trend toward generic habit-app
- Third 4.2 rejection from Apple if releases don't read as substantive
- Local-only data: user's history is one lost phone from gone; no backup path yet
- The app source exists only on this laptop — repo consolidation is the highest-priority infrastructure fix

---

## Technical Context

- Expo SDK 54, RN 0.81.5, TypeScript, @react-navigation/native-stack v7, new arch on
- **Storage:** expo-file-system/legacy ONLY — AsyncStorage crashes ("Native module is null")
- **Fonts:** Font.loadAsync in useEffect ONLY — useFonts hook causes Fabric boolean/string crash
- **Layout:** no `flex: 1` on Text (RN 0.81 breakage); NDot47 metrics unreliable — glyph-like UI (plus signs, etc.) uses absolute-positioned Views
- **Centering pattern:** footers use three `flex: 1` slots, center slot holds the button
- **Build/ship:** `eas build --platform ios --profile production` then `eas submit --platform ios --latest`; autoIncrement on
- **Git in sandbox:** identity via `git -c user.email="filippos@southnorth.se" -c user.name="Filippos Arvanitakis"`; push happens from user's Terminal (no sandbox auth); index.lock issues cleared by user via Terminal

---

## Report Back

After completing a task, update:

- `aios/tasks/TASK_XXX.md` — mark done-when items complete
- `aios/CHANGELOG.md` — log what changed
- `aios/DECISIONS.md` — log any new decisions made
- `aios/AI_HANDOFF.md` — update active task and current state before closing the session
