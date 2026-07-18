# DotDone — Resubmission v2 Recap

**Date:** May 2026  
**Status:** Waiting for Apple review

---

## Why it was rejected (first submission)

**Guideline 4.2 — Minimum Functionality**  
App was considered too limited in scope.

**Guideline 1.5 — Developer Information: Support URL**  
The support URL field was either missing or pointed to an invalid page.

---

## What changed

### 1. Tasks system (addresses 4.2)

- Added full colored task management: create, rename, reorder, delete tasks
- 36-color transit-inspired palette (`TASK_COLORS` in `src/utils/colors.ts`)
- Long-press on home screen opens task palette (bottom sheet modal)
- Short tap records a default black dot; long press records a colored, named dot
- Calendar shows colored dot indicators per day and task name next to each entry
- Up to 36 concurrent tasks supported

### 2. Support page (addresses 1.5)

- Created `assets/appstore/support.html`
- Hosted on GitHub Pages: `https://filippos-swg.github.io/dotdone/support.html`
- Added to App Store Connect under App Review Information → Support URL
- Covers: how it works, tasks, calendar, deleting data, contact

### 3. Reviewer notes

Added a note in the App Review Information field explaining the primary use case: a minimal tool for tracking daily habits and medication reminders, where simplicity is the core value proposition.

---

## Build & submission

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

- `eas.json` production profile has `autoIncrement: true` and `appVersionSource: remote`
- EAS auto-incremented the build number
- `eas submit --latest` picked up the new build and submitted automatically

---

## Files touched

| File | Change |
|------|--------|
| `src/screens/TasksScreen.tsx` | Full tasks CRUD UI, color picker, footer centering fix |
| `src/screens/HomeScreen.tsx` | Long-press palette, colored dot recording |
| `src/screens/CalendarScreen.tsx` | Colored dots, task name labels |
| `src/storage/tasks.ts` | CRUD for DotTask via expo-file-system/legacy |
| `src/utils/colors.ts` | 36-color TASK_COLORS palette |
| `src/types/index.ts` | DotTask and updated DotEntry types |
| `assets/appstore/support.html` | New support page |
| `app.json` | privacyPolicyUrl set |
