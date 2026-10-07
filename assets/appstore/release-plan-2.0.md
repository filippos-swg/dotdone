# Dot It 2.0 release checklist

- Use the existing App Store Connect app record, Apple app ID, EAS project, and `se.southnorth.dotdone` bundle ID. Do not create a new app record.
- Use a unique App Store listing name: App Store Connect rejected the exact name “Dot It” as already in use. The app binary's on-device display name is `Dot It`; the owner is verifying the icon label on an iPhone.
- Keep `dotdone_entries.json` and `dotdone_tasks.json` readable so the update retains old dots and tasks.
- Verify task reminders, notification denial, JSON sharing to Files/AirDrop, and widget logging on real devices before release.
- In TestFlight build 8, delete two mistaken Calendar dots and confirm the count falls by two; then add two deliberate dots and confirm exactly two new rows. Test the same task twice within five seconds and verify the confirmation does not silently save a third.
- From the task picker, create a named, colored task, save it, select it from the reopened picker, and confirm one colored dot appears on the selected day. Repeat on a past day, then use Back to Today.
- Confirm the label beneath the installed app icon reads `Dot It`; the native plist already declares that display name.
- Verify whether a dot recorded from the widget before a task's reminder time suppresses that day's pending notification. The JavaScript reminder sync runs when the app returns to the foreground; this interaction must be resolved before claiming the reminder always stays silent after a widget tap.
- Verify widget storage migration using an installation upgraded from v1.0 or v1.1 with existing entries.
- Open the upgraded app once before configuring the widget so it can copy existing task names into the App Group.
- Create updated screenshots showing the renamed home screen, reminders, export, and widget.
- Update the existing app's store name, description, What's New, screenshots, and build in App Store Connect. The owner submits the update for review.

Separate Apple provisioning profiles now exist for the main app and widget, and the shared App Group is enabled. Signed [production build 2.0.0 (8)](https://expo.dev/accounts/fliphq/projects/dotdone/builds/7909cdb0-bdf7-436a-9af0-5bf60d72faee) adds visible deletion, task creation from the picker, and a Today shortcut to build 7's duplicate guard and labeled Calendar action. It was [uploaded to the existing App Store Connect app](https://expo.dev/accounts/fliphq/projects/dotdone/submissions/d78b8cc9-872d-4da3-9ae3-eef195205c79) on 2026-10-07 and is [ready in the existing internal TestFlight group](https://appstoreconnect.apple.com/teams/460fc214-6895-4781-b4d4-a21105caeef7/apps/6767492017/testflight/ios/ab1c7b24-6c32-4288-afe1-1650e97cfa43) with focused What to Test notes. Device testing remains open. Builds 6 and 7 were uploaded earlier and are superseded for this retest. This is a TestFlight upload, not an App Store review submission.

Native compilation also passed in the [unsigned iOS Simulator build](https://expo.dev/accounts/fliphq/projects/dotdone/builds/c337a2b4-cda3-4b6b-9f99-10f4293c6cf6) on 2026-10-07. It does not replace real-device and upgrade testing.

Current App Store Connect observation (2026-10-07): version 1.0 (“DotDone — Dot It”) is Ready for Distribution; version 2.0.0 is a draft. Build 8 is processed, assigned to the existing internal tester group, and has saved build-specific test notes. No v2 App Store version has been submitted for review.
