# v1.1.0 — App Store "What's New" text

Paste into App Store Connect → version 1.1.0 → What's New:

---

Add dots straight from the calendar.

- New + button on the calendar: log a dot on any day without leaving the screen
- Forgot to log yesterday? Add the dot to a past day — it's marked "ADDED LATER" so your real times stay real
- Same task palette everywhere: tap + or hold the home screen

---

## Submission steps (from Terminal)

```bash
cd ~/Documents/Projects/dotdone
eas build --platform ios --profile production
# wait for build to finish, then:
eas submit --platform ios --latest
```

Then in App Store Connect:
1. My Apps → DotDone → + Version → 1.1.0
2. Paste the What's New text above
3. Select the new build when it finishes processing
4. Submit for review
