# Changelog

All meaningful project changes documented here.
Most recent first. Short entries — state what changed and why.

---

## 2026-07-18 — AIOS v1 structure created

### Added
- `aios/` — full AIOS v1 layer: AI_HANDOFF, PROJECT_BRIEF, PROJECT_CANON, DECISIONS, CHANGELOG, tasks/TASK_001
- `aios/tasks/TASK_001.md` — v1.1 scope: calendar quick-dot with backfill

### Notes
App is in Apple review (v1.0 resubmission). Repo consolidation pending — see OPEN decision in DECISIONS.md.

---

## 2026-07 — v1.0 resubmitted to Apple

### Updated
- App Store Connect — support URL fixed (Guideline 1.5), reviewer notes added explaining medication/habit tracking intent
- EAS build auto-incremented, submitted via `eas submit --latest`

### Notes
Status: Ready for Review. Full recap in `assets/appstore/resubmission-v2-recap.md`.

---

## 2026-05/06 — Tasks system built (Guideline 4.2 response)

### Added
- `src/screens/TasksScreen.tsx` — task CRUD, 36-color picker, reordering
- `src/utils/colors.ts` — TASK_COLORS transit palette
- `src/storage/tasks.ts` — task persistence (expo-file-system/legacy JSON)
- Home: hold-to-choose task palette (bottom sheet modal)
- Calendar: colored dot bullets, task name labels, per-day dot indicators
- `assets/appstore/support.html` — support page for GitHub Pages

### Updated
- `src/types/index.ts` — DotTask type, DotEntry gains color/taskId
- TasksScreen footer — three flex:1 slots so + button sits at exact screen center; View-based plus cross (NDot47 metrics unreliable)

---

## 2026-05 — v1.0 core app

### Added
- Home (tap-to-dot), Calendar (week/month, delete via long press), storage layer
- NDot47 font via Font.loadAsync; expo-file-system/legacy JSON storage

### Notes
Key constraints discovered: no AsyncStorage (native module null), no useFonts hook (Fabric crash), no flex:1 on Text (RN 0.81).

---

*Add new entries above this line.*
