# Dot It 2.0 release checklist

- Use the existing App Store Connect app record, Apple app ID, EAS project, and `se.southnorth.dotdone` bundle ID. Do not create a new app record.
- Use a unique App Store listing name: App Store Connect rejected the exact name “Dot It” as already in use. The app binary's on-device display name is `Dot It`; the owner is verifying the icon label on an iPhone.
- Keep `dotdone_entries.json` and `dotdone_tasks.json` readable so the update retains old dots and tasks.
- Verify task reminders, notification denial, JSON sharing to Files/AirDrop, and widget logging on real devices before release.
- Verify whether a dot recorded from the widget before a task's reminder time suppresses that day's pending notification. The JavaScript reminder sync runs when the app returns to the foreground; this interaction must be resolved before claiming the reminder always stays silent after a widget tap.
- Verify widget storage migration using an installation upgraded from v1.0 or v1.1 with existing entries.
- Open the upgraded app once before configuring the widget so it can copy existing task names into the App Group.
- Create updated screenshots showing the renamed home screen, reminders, export, and widget.
- Update the existing app's store name, description, What's New, screenshots, and build in App Store Connect. The owner submits the update for review.

Separate Apple provisioning profiles now exist for the main app and widget, and the shared App Group is enabled. Signed [production build 2.0.0 (7)](https://expo.dev/accounts/fliphq/projects/dotdone/builds/5abf576a-58ea-4c3c-bfc1-ef3a2ff13e8b) contains the Calendar duplicate guard, labeled add action, and date-selection correction. It was [uploaded to the existing App Store Connect app](https://expo.dev/accounts/fliphq/projects/dotdone/submissions/32bcbd42-3bc1-446e-83ca-6308cbc3acf2) on 2026-10-07 and is ready in the internal TestFlight group with build-specific test notes. Device testing remains open. Build 6 was uploaded earlier and is superseded for testing. This is a TestFlight upload, not an App Store review submission.

Native compilation also passed in the [unsigned iOS Simulator build](https://expo.dev/accounts/fliphq/projects/dotdone/builds/c337a2b4-cda3-4b6b-9f99-10f4293c6cf6) on 2026-10-07. It does not replace real-device and upgrade testing.

Current App Store Connect observation (2026-10-07): version 1.0 (“DotDone — Dot It”) is Ready for Distribution; version 2.0.0 is a draft. Build 7 is processed and assigned to the existing internal tester group. No v2 App Store version has been submitted for review.
