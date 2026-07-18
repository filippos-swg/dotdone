# EAS Build — Step-by-step guide

## Before you start
- Apple Developer account active (developer.apple.com, $99/year)
- Privacy policy hosted at a public URL (see privacy.html — host on GitHub Pages, Notion, or any webpage)
- App Store Connect account ready (appstoreconnect.apple.com — free, same Apple ID)

---

## 1. Install EAS CLI

In Terminal, inside the dotdone folder:

```bash
npm install -g eas-cli
```

## 2. Log in to Expo

```bash
eas login
```

Creates or logs in to your free Expo account.

## 3. Configure EAS in the project

```bash
eas build:configure
```

This creates an `eas.json` file in the project. Accept the defaults when prompted.

## 4. Add your Apple Bundle ID to app.json

Open `app.json` and add `bundleIdentifier` inside the `ios` block:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "se.southnorth.dotdone"
}
```

Pick any reverse-domain ID — it just needs to be unique and match what you register in App Store Connect.

## 5. Build for iOS

```bash
eas build --platform ios
```

EAS will:
- Ask if you want to create a new Apple Distribution Certificate (say Yes)
- Ask if you want to create a provisioning profile (say Yes)
- Upload your code to Expo's build servers
- Return a download link for the .ipa file when done (~10–20 min)

## 6. Submit to App Store

```bash
eas submit --platform ios
```

This uploads the built .ipa directly to App Store Connect.

---

## 7. Fill in App Store Connect

Go to appstoreconnect.apple.com → your app → App Store tab:

1. **App information**: name, subtitle, category (Health & Fitness), privacy policy URL
2. **Pricing**: Free
3. **App Store listing**: paste description, keywords from metadata.md
4. **Screenshots**: upload the 4 PNG files from assets/screenshots/
   - 6.9in files → "6.9-inch Display" slot
   - 6.1in files → "6.1-inch Display" slot
5. **Build**: select the build you just uploaded via EAS
6. **Review notes** (optional): "Simple habit tracker. Tap to log. No login required."

## 8. Submit for review

Hit "Submit for Review". Apple typically reviews in 24–48 hours for a new app.

---

## Subsequent updates

For future updates, bump the `version` in `app.json`, then:

```bash
eas build --platform ios
eas submit --platform ios
```
