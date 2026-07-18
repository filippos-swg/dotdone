# Project Brief

**Owner:** Filippos Arvanitakis
**Reviewer:** Filippos Arvanitakis
**Last updated:** 2026-07-18

---

## 1. Project Overview

### Project Name

DotDone

### Project Type

App (iOS, App Store)

### Short Definition

A minimal iOS habit log where one tap records a timestamped dot on a calendar.

## 2. Why This Exists

People forget whether they did small daily things — most critically, whether they took their medicine. Existing habit apps bury this in streaks, stats, and setup. DotDone strips it to the atomic action: tap, dot, done.

## 3. Core User / Audience

Individuals tracking menial recurring tasks — medication, vitamins, watering plants, feeding the cat. Starting user: Filippos himself. Secondary: anyone who finds full habit apps overbearing.

## 4. Core User Problem

"Did I already take it today?" — the memory gap around low-salience routine actions. The cost of forgetting ranges from annoyance to double-dosing medication.

## 5. Primary Value

Certainty through zero-friction recording. The log is trustworthy because logging is effortless.

## 6. Strongest Use Case

Morning medication: take the pill, tap the phone, done. Later that day, a glance at the calendar answers "did I?" definitively.

## 7. Success Condition

- Live on the App Store (currently: v1.0 in review, resubmitted after 4.2/1.5 rejections)
- Filippos uses it daily without friction
- The answer to "did I do the thing?" is always one glance away

## 8. Scope Boundary

Out of scope, per canon: todo features, notes on dots, stats/charts screens, social features, accounts, Android (until iOS is proven), Apple Watch (later consideration).

## 9. Constraints

- Solo project, built AI-assisted; no dev team
- Expo SDK 54 / RN 0.81 quirks: expo-file-system/legacy for storage, Font.loadAsync (not useFonts), no flex:1 on Text
- NDot47 font metrics are unreliable for centering — use View-based shapes for glyph-like UI
- App Store review risk: minimal apps attract Guideline 4.2 scrutiny; every release must feel complete
- All storage local JSON — no migration path pressure yet, but schema changes must be backward-compatible

## 10. Key Risks

- **Feature creep kills the identity.** Every "useful" addition pushes toward the habit-app genericness the canon forbids.
- **Local-only data is fragile.** Lost/reset phone = lost history. No backup path exists yet.
- **Discoverability of gestures.** Hold-to-choose-task was invisible enough that even the owner forgot it exists. Gesture-only UI hides functionality.
- **Apple review.** A third 4.2 rejection is possible; releases must demonstrably add utility.

## 11. Build Readiness

In review — v1.0 resubmitted to Apple (July 2026), awaiting decision.

## 12. Recommended Next Step

v1.1 planning: add dot from calendar (with backfill), improve task-palette discoverability. See `aios/tasks/TASK_001.md`.

---

**Final Rule**

This document defines why the project should exist.
Protect clarity.
