# Cadence - Project Instructions

## Soul

Read `SOUL.md` for personality, voice, and collaboration style.

## Tech Stack

- **Framework**: React Native 0.83 with Expo SDK 55, Expo Router
- **Language**: TypeScript (strict mode)
- **Styling**: React Native StyleSheet (no external CSS-in-JS)
- **Navigation**: Expo Router (file-based) + React Navigation 7
- **Animations**: React Native Reanimated 4, react-native-gesture-handler
- **Images**: expo-image
- **React**: v19.2 with React Compiler enabled (`reactCompiler: true`)
- **Runtime**: Hermes (default with Expo)

## Project Structure

```
src/
  app/          # Expo Router file-based routes
  components/   # Shared UI components
    ui/         # Primitive UI building blocks
  constants/    # Theme, colors, config
  hooks/        # Custom React hooks
assets/         # Images, fonts, icons
```

Path aliases: `@/*` maps to `./src/*`, `@/assets/*` maps to `./assets/*`.

## Skills

This project uses AI skills in `.claude/skills/` to ensure high-quality, idiomatic code. **Always apply relevant skills when generating or reviewing code.**

| Skill                         | When to use                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `react-native-best-practices` | Any performance work: FPS, TTI, bundle size, memory, re-renders, Hermes, JS thread, bridge |
| `vercel-react-native-skills`  | Building components, lists, animations, native modules, Expo patterns                      |
| `react-native-architecture`   | App structure, navigation, native modules, offline sync, cross-platform decisions          |
| `react-native-design`         | Styling, navigation UI, Reanimated animations                                              |
| `web-developer`               | Full-stack web features, API integration, dashboard/SPA work                               |

Skills live in `.agents/skills/` and are symlinked from `.claude/skills/`. Each contains a `SKILL.md` with detailed rules and a `references/` folder with deep-dive guides. **Consult these before writing code in their domain.**

## Coding Conventions

- Use functional components with hooks. No class components.
- Prefer `const` over `let`. Never use `var`.
- Use named exports, not default exports.
- File naming: `kebab-case.tsx` for components, `use-kebab-case.ts` for hooks.
- Platform-specific files: `*.web.ts` / `*.ios.ts` / `*.android.ts` when needed.
- Keep components focused and small. Extract hooks for reusable logic.
- Use `@/` path aliases for imports — never relative paths that climb more than one level (`../../`).

## React Native Rules

- Wrap all visible text in `<Text>` components — bare strings crash on native.
- Use `expo-image` (`<Image>`) instead of React Native's `<Image>`.
- Prefer Reanimated worklets for animations — keep the JS thread free.
- Use `react-native-gesture-handler` for gestures, not `PanResponder`.
- Avoid inline object/function creation in render for list items (see skills).
- Boolean short-circuits: use `{count > 0 ? <View /> : null}` not `{count && <View />}`.
- **Font clipping**: Large bold text (especially with `fontFamily: 'ui-rounded'`) needs explicit `lineHeight` — the default clips ascenders. Rule of thumb: `lineHeight` ≈ `fontSize * 1.2` (e.g. fontSize 34 → lineHeight 41, fontSize 28 → lineHeight 34).

## Animation Patterns

Follow these established patterns for consistent, polished feel:

- **Staggered entry**: Use `FadeInDown.delay(index * 60).duration(350).easing(Easing.out(Easing.cubic))` for lists/groups of elements appearing sequentially.
- **Press feedback**: Spring scale on `onPressIn`/`onPressOut` — `withSpring(0.93, { damping: 15, stiffness: 300 })` for chips/small elements, `0.97` for buttons, `0.85` for steppers.
- **Day circle bounce**: `withSequence(withSpring(0.85, fast), withSpring(1, slow))` for toggle interactions that feel physical.
- **Layout transitions**: Use `LinearTransition.springify().damping(18).stiffness(180)` on progress indicators and elements that change size.
- **Segment add/delete**: `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` for smooth list reflow.
- **Step transitions**: `FadeInRight.duration(350).easing(Easing.out(Easing.cubic))` for wizard-style forward navigation.
- **Skeleton loading**: Pulsing opacity (0.4 → 1 repeating, 800ms each direction) with `FadeIn.delay(index * 100)` stagger. Always show skeletons instead of blank screens during loading.

## Simulator Debugging

- Take screenshots: `xcrun simctl io booted screenshot /tmp/screenshot.png` — then read the PNG to visually verify UI.
- Use this to verify layout fixes, animation states, and visual regressions.

## Commands

```bash
npm start         # Start Expo dev server
npm run ios       # Run on iOS simulator
npm run android   # Run on Android emulator
npm run web       # Run in browser
npm run lint      # Run ESLint
```

## Do Not

- Do not install packages without asking first.
- Do not eject from Expo managed workflow.
- Do not use `any` type — find or create proper types.
- Do not use inline styles for anything beyond one-off tweaks — use StyleSheet.create.
- Do not bypass React Compiler assumptions (no manual `useMemo`/`useCallback` unless the compiler can't handle the case).
