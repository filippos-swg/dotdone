# DotDone — Canon

**Owner:** Filippos Arvanitakis

Frozen except by a dated decision in `aios/LOG.md`. Canon is supposed to freeze; staleness
here is not a defect and `aios check` never reports it.

If a suggestion conflicts with this file, return here before proceeding.

---

## Identity

DotDone is a one-tap habit log: tap to record a timestamped dot, see your dots on a calendar. Nothing else.

## Purpose

Answer one question with zero friction: "did I do the thing today?" — primarily menial, easy-to-forget tasks like taking medicine. The record matters more than the ritual.

## Principles

- **The tap is the product.** Logging must never take more than one gesture from app open. Every feature is measured against this.
- **The dot is the unit.** No notes, no durations, no ratings, no metadata beyond time, date, and an optional task color/name.
- **Local and silent.** All data lives on-device. No accounts, no sync requirement, no analytics, no server.
- **One aesthetic.** NDot47 pixel font, black on white, colored dots as the only color. Transit-palette colors for tasks.
- **Calm, not motivational.** The app records; it does not judge, cheer, or guilt.

## What This Is Not

These are protected boundaries. Do not cross them.

- **Not a productivity suite.** No todo lists, no projects, no priorities, no due dates.
- **Not a gamified habit app.** No streaks-as-pressure, no badges, no confetti, no "don't break the chain" guilt mechanics.
- **Not a social product.** No sharing, no accounts, no leaderboards.
- **Not a dashboard.** No charts, graphs, or stats screens. The calendar IS the visualization.
- **Not a notes app.** Dots never carry free text.

## Who it is for

Individuals tracking menial recurring tasks — medication, vitamins, watering plants, feeding
the cat. First user: Filippos. Secondary: anyone who finds full habit apps overbearing.

**The problem:** *"Did I already take it today?"* — the memory gap around low-salience routine
actions. The cost of forgetting runs from annoyance to double-dosing medication.

**The value:** certainty through zero-friction recording. **The log is trustworthy because
logging is effortless** — which is why the one-gesture rule is a principle and not a
preference.

## Scope boundary

Out of scope: todo features, notes on dots, stats or chart screens, social features,
accounts, Android until iOS is proven, Apple Watch.

## Standing constraints

- Solo project, built AI-assisted. No dev team.
- Expo SDK 54 / RN 0.81: `expo-file-system/legacy` for storage, `Font.loadAsync` rather than
  `useFonts`, no `flex:1` on `Text`.
- **NDot47 font metrics are unreliable for centering** — use View-based shapes for
  glyph-like UI.
- All storage is local JSON. Schema changes must read old JSON gracefully.

## Standing risks

- **Feature creep kills the identity.** Every "useful" addition pushes toward the generic
  habit app this canon forbids. This is the one that actually happens.
- **Local-only data is fragile.** A lost or reset phone loses the history. No backup path
  exists.
- **Gesture-only UI hides functionality.** Hold-to-choose-task was invisible enough that the
  owner forgot it exists.
- **App Store review.** Minimal apps attract Guideline 4.2 scrutiny; two rejections already.
  Every release has to demonstrably add utility.

## What must not be touched

Recovered from `AI_HANDOFF.md` before that file was deleted in the v2 migration. These are
canon — they change only on a dated decision — and they were sitting in a state file that
was rewritten every session.

- **The Home tap/hold mechanic.** The behaviour is final.
- **Storage file names and existing JSON shapes.** `dotdone_entries.json` and
  `dotdone_tasks.json`. Read-compatibility with old data is required — see `resolveColor()`
  and its legacy handling. **A schema change that cannot read yesterday's file loses the
  user's history, and there is no backup path.**
- **The boundaries in "What This Is Not", above.**

## Primary intent

Ship the app aggressively minimal. Every addition is tested against one question: *does this
survive the canon?* The roadmap through v1.3 is reminders, then export, then the widget —
**that sequence is fixed and does not get reordered without a new decision entry.**

**Release discipline:** a feature set that is code-complete is not a release. v1.1 was held
until Apple decided on v1.0, deliberately — two Guideline 4.2 rejections mean releases have
to read as substantive, and stacking an unreviewed release on an unreviewed release is how a
third one happens.

## Source of truth

The GitHub repository is canonical: `filippos-swg/dotdone`. **It is public.**
