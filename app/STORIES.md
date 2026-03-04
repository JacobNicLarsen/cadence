# Cadence MVP — User Stories

## Context

Cadence is a habit planner app. The MVP focuses on one thing: making it dead simple to create timed habit routines and run them. No backend, no accounts, no social — just you and your habits, stored on your device.

---

## Data Model

```typescript
type Segment = {
  id: string;
  name: string;
  durationSeconds: number;
  type: 'activity' | 'pause';
};

type Habit = {
  id: string;
  name: string;
  segments: Segment[];
  createdAt: number;
  updatedAt: number;
};

type SessionRecord = {
  id: string;
  habitId: string;
  habitName: string;
  completedAt: number;
  totalDurationSeconds: number;
  segmentsCompleted: number;
};
```

---

## Navigation

```
Tabs:
  Home (index.tsx)        — today's habits as tappable cards
  Planner (planner.tsx)   — create/edit habits

Stack (from Home):
  session/[id].tsx        — active session (get ready → segments → done)
  session/complete.tsx    — celebration screen

Stack (from Planner):
  planner/new.tsx         — create habit form
  planner/[id].tsx        — edit habit form
```

---

## Epic 1: Data Model & Storage

### Story 1.1 — Define habit data types
**As a** developer, **I want** TypeScript types for habits, segments, and session records, **so that** the entire app has a single source of truth.

**Acceptance criteria:**
- `Habit`, `Segment`, `SessionRecord` types in `src/types/habit.ts`
- Named exports, no `any`
- IDs are strings

**Files:** `src/types/habit.ts` (new), `src/utils/id.ts` (new)

---

### Story 1.2 — Implement habit storage
**As a** developer, **I want** CRUD operations for habits in AsyncStorage, **so that** habits persist across restarts.

**Acceptance criteria:**
- `getHabits()` returns all habits sorted by `createdAt` desc
- `getHabit(id)` returns a single habit or null
- `saveHabit(habit)` upserts by ID
- `deleteHabit(id)` removes a habit
- Handles empty/missing storage gracefully

**Files:** `src/storage/habit-storage.ts` (new)

---

### Story 1.3 — Implement session record storage
**As a** developer, **I want** to save completed session records, **so that** the completion screen can show a summary.

**Acceptance criteria:**
- `saveSessionRecord(record)` appends to storage
- `getSessionRecords()` returns all records

**Files:** `src/storage/session-storage.ts` (new)

---

### Story 1.4 — Create data hooks
**As a** developer, **I want** hooks that load habits from storage, **so that** screens access data declaratively.

**Acceptance criteria:**
- `useHabits()` → `{ habits, loading, refresh }`
- `useHabit(id)` → `{ habit, loading }`
- Both load on mount, `refresh()` re-fetches

**Files:** `src/hooks/use-habits.ts` (new), `src/hooks/use-habit.ts` (new)

---

## Epic 2: Home Screen

### Story 2.1 — Build habit card component
**As a** user, **I want** to see each habit as a card with name, duration, and segment count, **so that** I can quickly pick one.

**Acceptance criteria:**
- Shows habit name (subtitle style)
- Shows total duration formatted as "Xm Ys"
- Shows segment count ("4 segments")
- Pressable with opacity feedback
- Uses `ThemedView` (`backgroundElement`), rounded corners, `Spacing` constants

**Files:** `src/components/habit-card.tsx` (new), `src/utils/format.ts` (new)

---

### Story 2.2 — Build home screen
**As a** user, **I want** the home screen to list my habits as tappable cards, **so that** I can start one.

**Acceptance criteria:**
- Title at top ("Today" or app name)
- `FlatList` of `HabitCard` components
- Empty state: "No habits yet — create one in the Planner"
- Tapping a card navigates to `/session/[id]`
- Refreshes on tab focus (for after creating habits in planner)

**Files:** `src/app/index.tsx` (modify — replace starter content)

---

### Story 2.3 — Update tab navigation
**As a** user, **I want** Home and Planner tabs, **so that** I can switch between running and managing habits.

**Acceptance criteria:**
- Two tabs: Home, Planner
- Explore tab removed
- Appropriate icons for each

**Files:** `src/components/app-tabs.tsx` (modify), `src/components/app-tabs.web.tsx` (modify), delete `src/app/explore.tsx`

---

## Epic 3: Planner

### Story 3.1 — Build planner list screen
**As a** user, **I want** to see all my habits in the planner with a create button, **so that** I can manage my routines.

**Acceptance criteria:**
- Lists habits with name and segment count
- Tapping a habit navigates to edit form
- "+" button to create new habit
- Empty state with create prompt

**Files:** `src/app/planner.tsx` (new), `src/app/planner/_layout.tsx` (new)

---

### Story 3.2 — Build segment row component
**As a** user, **I want** to see and manage individual segments, **so that** I can customize my routine structure.

**Acceptance criteria:**
- Shows segment name, type badge (activity/pause), duration
- Delete button (X icon)
- Type visually distinct (different color for pause vs activity)

**Files:** `src/components/segment-row.tsx` (new)

---

### Story 3.3 — Build duration input
**As a** user, **I want** an easy way to set duration in minutes and seconds, **so that** I can precisely time segments.

**Acceptance criteria:**
- Stepper approach: `- [MM] + : - [SS] +`
- Min 5 seconds, max 60 minutes
- Converts to/from `durationSeconds`

**Files:** `src/components/duration-input.tsx` (new)

---

### Story 3.4 — Build create/edit habit form
**As a** user, **I want** to name a habit and add timed segments, **so that** I can build my custom routine.

**Acceptance criteria:**
- Text input for habit name (required)
- "Add Segment" button → appends default segment (30s, activity type)
- Each segment: editable name, duration input, activity/pause toggle
- Segments deletable (min 1 required)
- Save button persists and navigates back
- Edit mode: pre-populates, shows delete habit option
- Validation: name required, at least 1 segment with a name

**Files:** `src/components/habit-form.tsx` (new), `src/app/planner/new.tsx` (new), `src/app/planner/[id].tsx` (new)

---

## Epic 4: Active Session

### Story 4.1 — Build useTimer hook
**As a** developer, **I want** a countdown timer hook, **so that** segments count down accurately.

**Acceptance criteria:**
- `useTimer(durationSeconds, onComplete)` → `{ remaining, isRunning, start, pause, reset }`
- Counts down to 0, fires `onComplete`
- 1-second tick granularity
- Can pause/resume
- Cleans up on unmount

**Files:** `src/hooks/use-timer.ts` (new)

---

### Story 4.2 — Build timer display
**As a** user, **I want** a large countdown and progress bar, **so that** I can track time at a glance.

**Acceptance criteria:**
- Large centered MM:SS countdown
- Current segment name displayed prominently
- Activity/pause type indicator
- Animated progress bar (Reanimated `withTiming`)

**Files:** `src/components/timer-display.tsx` (new)

---

### Story 4.3 — Build segment progress indicator
**As a** user, **I want** to see which segment I'm on, **so that** I know overall progress.

**Acceptance criteria:**
- Row of dots/pills: filled = done, highlighted = current, outline = upcoming
- "Segment 2 of 5" text

**Files:** `src/components/segment-progress.tsx` (new)

---

### Story 4.4 — Build active session screen
**As a** user, **I want** a "Get Ready" countdown then auto-advancing segment timers, **so that** I can follow my routine hands-free.

**Acceptance criteria:**
- Loads habit by route param ID
- Phase 1: "Get Ready" 5-second countdown
- Phase 2: Runs segments sequentially with timer
- Brief "Next up: [segment name]" preview (2-3 seconds) between segments
- Auto-advances after preview
- After last segment → navigates to completion
- Pause/Resume button
- Stop button with confirmation alert → back to Home
- Screen stays awake (`expo-keep-awake`)
- No header (immersive)

**Session phases:** `getReady` (5s) → `active` (segment timer) → `transition` (2-3s "Next up" preview) → `active` → ... → `complete`

**Files:** `src/app/session/_layout.tsx` (new), `src/app/session/[id].tsx` (new)

---

## Epic 5: Completion

### Story 5.1 — Build completion screen
**As a** user, **I want** a celebration screen after finishing, **so that** I feel accomplished.

**Acceptance criteria:**
- "Complete!" title with checkmark icon
- Shows habit name, total time, segments completed
- "Done" button returns to Home
- Saves `SessionRecord` to storage on mount
- Entrance animation (scale + fade via Reanimated)

**Files:** `src/app/session/complete.tsx` (new)

---

## Implementation Order

| Phase | Stories | What it unblocks |
|-------|---------|-----------------|
| 1. Foundation | 1.1, 1.2, 1.3, 1.4, 2.3 | Types, storage, hooks, tabs |
| 2. Screens | 2.1, 2.2, 3.1, 3.2, 3.3, 3.4 | Home + Planner |
| 3. Session | 4.1, 4.2, 4.3, 4.4 | Active timer flow |
| 4. Finish | 5.1 | Completion screen |

**Packages to install:** `@react-native-async-storage/async-storage`, `expo-keep-awake`

---

## Verification

1. Create a habit in the Planner with 3 segments (activity, pause, activity)
2. See it appear on the Home screen
3. Tap it → "Get Ready" countdown → segments run in sequence → completion screen
4. "Done" returns to Home
5. Kill and restart the app → habit persists
6. Edit the habit in Planner → changes reflected
7. Delete the habit → removed from Home
8. Test light and dark mode
9. Test on iOS simulator + web
