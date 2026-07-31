# TASK 003 — Data Export via Share Sheet (v1.2)

**Status:** Not started (sequenced after TASK_002)
**Owner:** AI (Claude session) with Filippos review
**Reviewer:** Filippos
**Branch:** task/003-data-export
**Last updated:** 2026-07-18

---

## Goal

One button that exports the full dot history and task list as a single JSON file through the iOS share sheet (AirDrop, Files, mail, anywhere).

## Context

All data is local by design (canon). That also means one lost or reset phone erases the entire history. Export is the cheapest possible insurance with near-zero UI weight — and it stays true to "no accounts, no sync, no server."

## Instructions

1. Read: `aios/STATE.md` first, then `aios/CANON.md`
2. Combine entries + tasks into one JSON: `{ version: 1, exportedAt, tasks: [...], entries: [...] }`
3. Write to a temp file, hand it to the share sheet via expo-sharing
4. Placement: a single "EXPORT DATA" text row at the bottom of the MY TASKS screen — small, grey, out of the way
5. No import in this task — log import as a follow-up decision only if export sees real use

## Output

- `src/utils/exportData.ts`
- One row in TasksScreen

## Constraints

- No cloud services, no backend, no iCloud entitlement in this task
- No settings screen — one row, one tap, share sheet, done
- Export format versioned from day one

## Done When

- [ ] Export produces one valid JSON with all tasks and entries
- [ ] Share sheet opens and file transfers via AirDrop and Files
- [ ] Zero-data state handled (exports empty arrays, doesn't crash)
- [ ] Tested on device
- [ ] Decision or change entry written in `aios/LOG.md`; `aios/STATE.md` regenerated at close
- [ ] Human review complete
