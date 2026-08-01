---
name: flutter-mobile-design
description: Flutter architecture, Material 3 UI aesthetics, Riverpod/Bloc state management, custom animations, and cross-platform mobile design guidelines.
---

# Flutter & Mobile UI Design System

## 1. Flutter Architecture Standards
- **State Management**: Prefer Riverpod (`flutter_riverpod`) or BLoC (`flutter_bloc`) for clean separation of UI and business logic.
- **Layering**:
  - `data/`: Repositories, API providers, Local Storage (Hive/Isar/Sqflite).
  - `domain/`: Entities, Use Cases, Value Objects.
  - `presentation/`: Widgets, Screens, State Notifiers/Controllers.

## 2. Visual Excellence & UX Guidelines
- **Design Language**: Material 3 with customized dark theme tokens (`ColorScheme.fromSeed(seedColor: Color(0xFF10B981), brightness: Brightness.dark)`).
- **Glassmorphism in Flutter**: Use `BackdropFilter` with `ImageFilter.blur` for sleek translucent cards and modals.
- **Animations**:
  - Explicit animations via `AnimationController` & `AnimatedBuilder`.
  - Implicit animations (`AnimatedContainer`, `AnimatedOpacity`, `Hero` page transitions).
  - High performance targets: 60 FPS / 120 FPS target rendering without junk frames.
- **Haptics**: Integrate subtle tactile feedback (`HapticFeedback.lightImpact()`) on button presses and milestone unlocks.
