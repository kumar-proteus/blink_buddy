<!-- Copilot instructions for contributors and AI agents -->
# Blink Buddy — Copilot Instructions

Purpose: Give AI coding agents the minimum, high-value knowledge to be productive in this repository.

Quick start (commands)
- Install deps: `yarn` (or `npm install`).
- Start Metro: `yarn start`.
- Run Android (emulator/device): `yarn android` or `npx react-native run-android`.
- Run iOS (macOS): `cd ios && bundle install && bundle exec pod install` then `yarn ios` (or open Xcode).
- Run tests: `yarn test` (Jest configured via `jest.config.js`).

Architecture overview — why things are structured this way
- This is a React Native (TypeScript) app whose UI lives in `App.tsx` and `components/`.
- Overlay functionality is implemented with a hybrid JS ⇄ native approach:
  - JS calls a native bridge `Overlay` (see [OverlayModule.kt](android/app/src/main/java/com/awesomeproject/overlay/OverlayModule.kt)).
  - The native side starts an Android service `OverlayService` which inflates overlay XML layouts from `android/app/src/main/res/layout/` (files like `overlay_view_blue.xml`).
  - Different overlay styles/colors are modeled as resources (e.g. `res/drawable/circle_blue.xml`) and separate overlay packages under `android/.../overlay_*`.
- Background/foreground notification logic is handled in JS via `android/app/src/services/ForegroundService.js` which uses `@voximplant/react-native-foreground-service` and creates a notification channel at runtime.

Key integration points (reference files)
- App root: [App.tsx](App.tsx) — top-level navigation and main screens.
- UI components: [components/ToggleButton.tsx](components/ToggleButton.tsx), [components/EyeShow.tsx](components/EyeShow.tsx), [components/UsageScreen.tsx](components/UsageScreen.tsx).
- Native bridge: [android/app/src/main/java/com/awesomeproject/overlay/OverlayModule.kt](android/app/src/main/java/com/awesomeproject/overlay/OverlayModule.kt).
- Android service + layouts: [android/app/src/main/java/com/awesomeproject/overlay/OverlayService.kt](android/app/src/main/java/com/awesomeproject/overlay/OverlayService.kt) and [android/app/src/main/res/layout/](android/app/src/main/res/layout/).
- JS foreground service: [android/app/src/services/ForegroundService.js](android/app/src/services/ForegroundService.js).
- Patches: `patches/` — repo includes a patch for the foreground-service package (`@voximplant...`) which may be required for builds.

Project-specific patterns and conventions
- Overlays: each color/variant has resource files and sometimes a separate native package under `overlay_*`. Use the existing naming `overlay_view_<color>.xml` and `circle_<color>.xml` when adding variants.
- Bridge API: the bridge exposes `Overlay.showOverlay(onDuration, offDuration, size, color)` and `Overlay.hideOverlay()` (see `OverlayModule.kt`). Maintain the parameter types and ordering when calling from JS.
- Permissions: Android overlay permission (SYSTEM_ALERT_WINDOW) is requested in the native bridge; Android 13+ notification permission (`POST_NOTIFICATIONS`) is requested in `ForegroundService.js`. When changing permission flows, update both native and JS flows.
- Animations & UI: components use React Native Animated API (see `ToggleButton.tsx`) and expect `Animated.Value` for transitions — follow the same pattern for new interactive controls.
- TypeScript: keep `.tsx`/`.ts` typings consistent with existing components.

Build / edit guidance for AI agents
- For quick JS-only changes: rely on Fast Refresh — `yarn start` + reload the app.
- For changes that touch native Android code (Java/Kotlin, resources, gradle): always rebuild the native app. From repo root run:
  ```bash
  cd android
  ./gradlew clean
  ./gradlew assembleDebug
  ```
  Or use `npx react-native run-android` to install to device/emulator.
- For iOS native edits: `cd ios && bundle exec pod install`, then build via Xcode or `npx react-native run-ios`.
- If you change native dependencies, check `patches/` — the repo uses a patch for `@voximplant/react-native-foreground-service`; reapply or update the patch when upgrading that dependency.

Testing and debugging notes
- Unit tests: `yarn test` (Jest) — look at `__tests__/App.test.tsx` for examples.
- Android logs: use `adb logcat` or `npx react-native log-android` to inspect overlay/service logs.
- iOS logs: use Console in Xcode or `npx react-native log-ios`.

Safety / permission gotchas
- Overlay permission: builds targeting Android M+ must request draw-over-other-apps; the native `Overlay` module opens the settings page if permission is missing.
- Notification text/content: `ForegroundService.js` sets notification text and icon names. Ensure the notification icon resource exists and follows Android notification icon guidelines (white silhouette for status bar icons).

How AI agents should make edits
- Make minimal, focused changes; run the exact commands above to validate native changes.
- When editing native bridge signatures, update both native and JS call sites and include a small test that triggers the change (e.g., a temporary button in `App.tsx` or `UsageScreen` that calls the bridge).
- Prefer altering resource XMLs under `android/app/src/main/res/` for UI tweaks rather than creating ad-hoc programmatic views in Java/Kotlin.

If something's unclear
- Ask for runtime reproduction steps (emulator vs device) and which platform (Android vs iOS).
- Point to a specific file or failing command; I'll run the build/logs locally and iterate.

Examples (concrete):
- Bridge call example: JS should call a method mirroring the native signature, e.g. `NativeModules.Overlay.showOverlay(3000, 2000, 40, 'blue')` which maps to `showOverlay(onDuration, offDuration, size, color)` in `OverlayModule.kt`.
- Foreground service channel creation: see `CreateChannel()` in [android/app/src/services/ForegroundService.js](android/app/src/services/ForegroundService.js).

End.
