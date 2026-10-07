# TASK 005 — TestFlight Calendar logging and flow

**Status:** Build 10 in preparation; final device and store review pending
**Owner:** AI with Filippos device review
**Branch:** feature/dot-it-v2
**Last updated:** 2026-10-07

## Goal

Make Calendar logging trustworthy and make the next action obvious after reviewing a day.

## Evidence

During 2.0.0 (5) TestFlight testing, Filippos reported four saved dots after making two through Calendar. A screenshot showed four separate default-dot rows at 10:55. The exact trigger is unconfirmed. Filippos also asked for a labeled action in the blank space below the calendar and reported the old combined name under the installed icon. The 2.0.0 (5) IPA itself declares `CFBundleDisplayName` as `Dot It`.

## Scope

- Ignore overlapping Calendar save callbacks; ask before another dot of the same task and day within five seconds.
- Replace the footer + with a labeled Calendar action. Keep the Home tap/hold behavior unchanged.
- Verify that TestFlight logging and the installed icon behave as expected on an iPhone.
- Review the path for creating a named, colored task after the logging issue is stable.
- Make mistaken dots removable without discovering a long-press gesture.
- Let the task picker create a named, colored task and return to logging.

## Done when

- [x] Calendar guards rapid duplicate saves and still permits a confirmed second dot.
- [x] Calendar has a labeled Make a Dot / Make Another Dot action below the grid.
- [x] Calendar browsing keeps the selected day, grid, and add destination aligned.
- [x] Home and Tasks empty-state copy explain how to make named, colored dots.
- [x] TypeScript, unit tests, and iOS Metro export pass.
- [x] Signed 2.0.0 (7) build uploaded to the existing App Store Connect app.
- [x] Updated signed build is available in TestFlight with build-specific test notes.
- [x] Calendar rows have visible confirmed deletion and scroll when the day is full.
- [x] Task picker opens new-task creation and returns to the same logging context.
- [x] Calendar offers a Today shortcut when browsing another day.
- [x] Signed 2.0.0 (8) build uploaded to the existing App Store Connect app.
- [x] Build 8 processes and is available to the internal tester group with focused notes.
- [x] Empty Calendar days put Make a Dot in the unused day area; days with entries keep Make Another Dot.
- [x] Calendar deletion and task color validation use app-styled dialogs.
- [x] My Tasks has an explicit Add a Colored Task action and a labeled color picker.
- [x] App Store Connect name saved as `Dot It: Simple Habit Log`; icon label remains `Dot It`.
- [x] TypeScript, four data tests, and iOS Metro export pass for this follow-up.
- [x] Signed 2.0.0 (9) production build compiles.
- [x] Signed 2.0.0 (9) uploaded to the existing App Store Connect app.
- [x] New signed build reaches the internal TestFlight group with focused notes.
- [x] Calendar Dot It footer is larger and underlined.
- [x] Task picker offers five ready-made colored tasks, reusing any existing task with the same name.
- [x] TypeScript, focused data tests, and iOS Metro export pass after the ready-made task change.
- [ ] Owner verifies two deliberate Calendar actions make exactly two entries.
- [ ] Owner verifies final build's TestFlight title and installed icon label on device. Build 9 TestFlight still showed the old approved title despite the saved App Store Connect name.
- [ ] Replace inherited preview screenshots that still show the old Home title with authentic captures from the updated app before public release.
- [ ] New task creation, deletion, navigation, and history are verified on an iPhone.
- [ ] Final signed build replaces build 5 in the App Store version draft and passes Apple processing.
- [ ] Submit version 2 to App Review after final screenshots and metadata are current.
