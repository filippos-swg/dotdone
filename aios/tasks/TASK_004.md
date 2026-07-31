# TASK 004 — iOS Home-Screen Widget (v1.3)

**Status:** Not started — BLOCKED until v1.1 ships and v1.0 passes Apple review
**Owner:** AI (Claude session) with Filippos review
**Reviewer:** Filippos
**Branch:** task/004-home-widget
**Last updated:** 2026-07-18

---

## Goal

A home-screen widget that logs a dot without opening the app: tap the widget, dot recorded. The purest expression of "the tap is the product."

## Context

Highest long-term value, biggest technical lift. Requires a native WidgetKit extension, which means leaving plain Expo Go workflow (config plugin / dev client, EAS build for every iteration) and sharing storage between app and widget via an App Group. Do not start this while cheaper wins (TASK_001–003) are unshipped.

## Scope decisions to make before starting

- **Interactivity:** iOS 17+ App Intents allow logging directly from the widget. Pre-17 fallback is deep-link into the app. Decide minimum iOS version.
- **Which task:** widget shows one user-chosen task (e.g. MEDICINE) or the default black dot. One widget = one task; multiple widgets for multiple tasks.
- **Storage:** entries JSON must move to (or be mirrored in) an App Group container so the widget extension can write. This is a storage migration — schema care required.

## Instructions

1. Read: `aios/STATE.md` first, then `aios/CANON.md`, then `aios/LOG.md`
2. Resolve the three scope decisions above with Filippos, log them in `aios/LOG.md`
3. Spike: config plugin (e.g. @bacons/apple-targets or expo-apple-targets) for the widget target; verify EAS build works before writing widget UI
4. Widget visual: NDot47 aesthetic, single dot on white, task name below — nothing else

## Output

- Widget extension target, App Group storage migration, widget UI
- Updated build documentation in `assets/appstore/`

## Constraints

- Widget shows no stats, no streaks, no counts — it is a button, not a dashboard
- Storage migration must preserve all existing entries losslessly
- Do not break the Expo Go dev loop for the main app more than necessary

## Done When

- [ ] Tapping the widget records a dot without opening the app (iOS 17+)
- [ ] App and widget read/write the same store with no data loss
- [ ] Existing users' data migrates transparently
- [ ] EAS production build passes
- [ ] Decision or change entry written in `aios/LOG.md`; `aios/STATE.md` regenerated at close
- [ ] Human review complete
