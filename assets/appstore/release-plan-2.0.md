# Dot It 2.0 release checklist

- Use the existing App Store Connect app record, Apple app ID, EAS project, and `se.southnorth.dotdone` bundle ID. Do not create a new app record.
- Check that “Dot It” is available as the App Store name in each intended localization.
- Keep `dotdone_entries.json` and `dotdone_tasks.json` readable so the update retains old dots and tasks.
- Verify task reminders, notification denial, JSON sharing to Files/AirDrop, and widget logging on real devices before release.
- Verify whether a dot recorded from the widget before a task's reminder time suppresses that day's pending notification. The JavaScript reminder sync runs when the app returns to the foreground; this interaction must be resolved before claiming the reminder always stays silent after a widget tap.
- Verify widget storage migration using an installation upgraded from v1.0 or v1.1 with existing entries.
- Open the upgraded app once before configuring the widget so it can copy existing task names into the App Group.
- Create updated screenshots showing the renamed home screen, reminders, export, and widget.
- Update the existing app's store name, description, What's New, screenshots, and build in App Store Connect. The owner submits the update for review.

The signed [EAS iOS production build 5](https://expo.dev/accounts/fliphq/projects/dotdone/builds/2052688b-b6df-48e1-b524-8ec261a0bf9b) finished on 2026-10-07. Separate Apple provisioning profiles now exist for the main app and widget, and the shared App Group is enabled. The build was [uploaded to App Store Connect](https://expo.dev/accounts/fliphq/projects/dotdone/submissions/6d227ec9-21b0-4a0b-a70e-e3ed05b3cf29) and is processing for TestFlight. This is a test upload, not an App Store review submission. Device and upgrade testing remain required.

Native compilation also passed in the [unsigned iOS Simulator build](https://expo.dev/accounts/fliphq/projects/dotdone/builds/c337a2b4-cda3-4b6b-9f99-10f4293c6cf6) on 2026-10-07. It does not replace real-device and upgrade testing.

Current App Store Connect observation (2026-10-07): version 1.0 (“DotDone — Dot It”) is Ready for Distribution; its two TestFlight builds are expired. The 2.0.0 build 5 upload is processing. No v2 App Store version has been submitted for review.
