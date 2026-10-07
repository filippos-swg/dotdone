# TASK 005 — TestFlight Calendar logging and flow

**Status:** Build 7 ready in the internal TestFlight group; device retest pending
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

## Done when

- [x] Calendar guards rapid duplicate saves and still permits a confirmed second dot.
- [x] Calendar has a labeled Make a Dot / Make Another Dot action below the grid.
- [x] Calendar browsing keeps the selected day, grid, and add destination aligned.
- [x] Home and Tasks empty-state copy explain how to make named, colored dots.
- [x] TypeScript, unit tests, and iOS Metro export pass.
- [x] Signed 2.0.0 (7) build uploaded to the existing App Store Connect app.
- [x] Updated signed build is available in TestFlight with build-specific test notes.
- [ ] Owner verifies two deliberate Calendar actions make exactly two entries.
- [ ] Installed icon label discrepancy is understood on device.
- [ ] Named-color creation flow is revised or explicitly accepted after review.
