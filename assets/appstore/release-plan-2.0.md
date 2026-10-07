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

The first EAS v2 build could not start: the main target has credentials, but `se.southnorth.dotdone.widget` needs its own Apple identifier and provisioning profile. Run `eas credentials --platform ios`, select `production`, sign in to the Apple Developer account, and set up build credentials for the widget target. Then run `eas build --platform ios --profile production`. The owner should test the build through TestFlight before submitting the App Store update.

Native compilation passed in the [unsigned iOS Simulator build](https://expo.dev/accounts/fliphq/projects/dotdone/builds/c337a2b4-cda3-4b6b-9f99-10f4293c6cf6) on 2026-10-07. It does not replace real-device and upgrade testing.

Current observation (2026-10-07): the public Swedish App Store listing shows version 1.0 (“DotDone — Dot It”); EAS has a completed 1.1.0 production build. App Store Connect's private submission status has not been verified.
