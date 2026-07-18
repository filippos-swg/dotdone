# TASK 001 — Calendar Quick-Dot with Backfill (v1.1)

**Status:** Done — device-tested 2026-07-18
**Owner:** AI (Claude session) with Filippos review
**Reviewer:** Filippos
**Branch:** task/001-calendar-quick-dot
**Last updated:** 2026-07-18

---

## Goal

Add dot creation directly on the Calendar screen: a + button that opens the existing task palette and logs the dot to the currently selected day — including past days (backfill).

## Context

Current flow forces Home → tap → auto-navigate to Calendar. Reviewing the calendar and noticing a missing dot requires a round trip to Home. This breaks the core loop and buries the task palette (hold gesture on Home is invisible — even the owner forgot it exists). Surfacing the palette behind a visible + on Calendar fixes both.

## Instructions

1. Read: `aios/PROJECT_BRIEF.md`, `aios/PROJECT_CANON.md`, `aios/DECISIONS.md`
2. Extract the task palette modal from `HomeScreen.tsx` into a shared component (`src/components/TaskPalette.tsx`) — do not duplicate it
3. Add a + button to CalendarScreen footer, centered, reusing the View-based cross pattern from TasksScreen (NDot47 metrics unreliable — no text glyph)
4. Tap + → palette opens → selection saves a dot with `date = selectedDate`
5. Resolve the OPEN timestamp decision for backdated dots (DECISIONS.md) with Filippos before implementing the display
6. Refresh the calendar in place after save — no navigation away

## Output

- `src/components/TaskPalette.tsx` (new, shared)
- `CalendarScreen.tsx` — + button, palette wiring, in-place refresh
- `HomeScreen.tsx` — refactored to use shared palette, behavior unchanged

## Constraints

- Do not change the Home tap/hold mechanic
- No new screens, no onboarding overlays
- Dot stays metadata-free (canon)
- Storage schema unchanged except timestamp convention for backfill
- Footer layout must keep + at exact screen center (three flex:1 slots pattern)

## Done When

- [x] Dot can be created on Calendar for today without leaving the screen
- [x] Dot can be created for a past selected day
- [x] Backdated timestamp convention decided and implemented ("ADDED LATER")
- [x] Palette is a single shared component used by Home and Calendar
- [x] Tested in Expo Go on device
- [x] `aios/CHANGELOG.md` updated
- [x] `aios/AI_HANDOFF.md` updated with next active task
- [x] Human review complete (owner tested on device, approved)
