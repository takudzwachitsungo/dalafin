---
name: mobile-app-development
description: Cross-platform mobile development practices, offline-first data sync, push notifications, biometrics, and native device integration.
---

# Mobile App Development Best Practices

## 1. Offline-First Architecture
- **Local Persistence**: Store core budget state, pending transactions, and streak counters locally on device using secure encrypted storage (e.g. Flutter `flutter_secure_storage` or React Native `MMKV`).
- **Sync Engine**: Queue outgoing transactions when offline and sync seamlessly when network connectivity is restored.

## 2. Native Capabilities & Security
- **Biometric Authentication**: Secure application launch with FaceID / TouchID / Fingerprint API.
- **Local Push Notifications**: Schedule local reminders for daily spending reflections and emergency pause countdown expiry without requiring a server connection.
- **Deep Linking**: Support universal links (`https://dalafin.app/item/...`) to open specific impulse items or reports directly.
