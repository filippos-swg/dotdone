# TASK 004 — iOS Home-Screen Widget (Dot It v2)

**Status:** Implementation in progress; native build blocked on widget provisioning profile
**Owner:** AI (Claude session) with Filippos review
**Reviewer:** Filippos
**Branch:** feature/dot-it-v2
**Last updated:** 2026-10-07

---

## Goal

A home-screen widget that logs a dot without opening the app: tap the widget, dot recorded. The purest expression of "the tap is the product."

## Context

Highest long-term value, biggest technical lift. Requires a native WidgetKit extension, which means leaving plain Expo Go workflow (config plugin / dev client, EAS build for every iteration) and sharing storage between app and widget via an App Group. The owner grouped the existing roadmap into Dot It v2 on 2026-10-07.

## Scope decisions to make before starting

- **Interactivity:** Implemented with iOS 17+ App Intents; older supported iOS opens the app from the widget. Awaiting owner/device confirmation.
- **Which task:** One user-chosen task per iOS 17+ widget; multiple widgets can choose different tasks. Awaiting owner/device confirmation.
- **Storage:** Existing app files stay readable. The widget writes each tap to a separate App Group file; the app merges those files with legacy entries into an App Group history file, preserving the old JSON shape. Device migration test pending.

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
- [ ] Widget dots merge into the app's history with no data loss
- [ ] Existing users' data migrates transparently
- [ ] EAS production build passes
- [ ] Decision or change entry written in `aios/LOG.md`; `aios/STATE.md` regenerated at close
- [ ] Human review complete
