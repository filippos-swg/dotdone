Standard: AiOS v2.0 · canon: `aios/CANON.md` · **Profile:** build · **Visibility:** public
State: read `aios/STATE.md` first. If its HEAD stamp ≠ `git rev-parse HEAD`, or the tree is dirty, regenerate before acting.
Truth: git history and `aios/`. Not chat. Not this file.
Depends on: nothing
Do not create AiOS core files at project root. Commit as filippos@southnorth.se.

## What this is

DotDone — a one-tap iOS habit log. Tap to record a timestamped dot; see your dots on a
calendar. Live on the App Store. React Native / Expo, TypeScript, local storage only.

**This repo is public.** No third-party names with quantities, no account numbers, no
government identifiers, no credentials — write the pointer, not the payload.

## Entry points

| You want | Read |
|---|---|
| What is true right now, and what is unpushed | `aios/STATE.md` — generated, never hand-edited |
| What the app is and what it must never become | `aios/CANON.md` |
| What was decided, and what awaits a verdict | `aios/LOG.md` |
| The live unit of work | `aios/tasks/` |

Build and submission run through EAS. The owner completes App Store submission by hand.
