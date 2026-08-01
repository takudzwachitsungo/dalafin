---
name: fullstack-web-design
description: Design system guidelines, UI/UX aesthetics, modern TailwindCSS styling, Framer Motion animations, and React component structure for the Dalafin frontend.
---

# Fullstack Web & UI/UX Design System Guidelines

## 1. Aesthetic Principles
- **Color Palette**: Dark & Vibrant modern theme. Primary accents: Emerald (`#10B981`) for savings/positive events, Amber (`#F59E0B`) for warnings/cooldowns, Rose/Red (`#EF4444`) for emergency pause/over-budget, Indigo/Blue (`#6366F1`) for info & benchmarks.
- **Glassmorphism & Depth**: Subtle backdrop blurs (`backdrop-blur-md`), dark border highlights (`border border-white/10`), soft multi-layered drop shadows.
- **Typography**: Inter/Outfit sans-serif font stack. Clear visual hierarchy with medium-to-bold headings, clean muted subtexts (`text-slate-400`).
- **Interactive Feedback**: Micro-animations with Framer Motion on hover, focus, and state changes.

## 2. Component Best Practices
- **Atomic & Modular**: Keep components focused in `src/components/finance`, `src/components/modals`, and `src/components/ui`.
- **Accessibility (a11y)**: Ensure clear contrast, unique element IDs, keyboard navigability (`aria-labels`), and readable text sizes.
- **State Integration**: Connect components cleanly via `useApp()` context or local state hooks. Avoid unnecessary prop drilling.
