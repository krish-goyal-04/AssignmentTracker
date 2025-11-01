# Architecture

This project is a client‑only React application that simulates a student–assignment system using JSON seeds and localStorage. It emphasizes clear role separation, responsive UI, and a simple, testable data flow.

## Overview

- UI: React 19 + Tailwind CSS (v4)
- Router: React Router DOM (SPA routes)
- State: Global state via `AppContext` for `user` and `assignments`
- Persistence: localStorage (seeded from `/src/data/*.json`)
- Animations: Framer Motion

## Modules

- `pages/`: Route-level components (`Login`, `StudentDashboard`, `ProfessorDashboard`)
- `components/`: Role-specific + shared UI pieces
- `context/`: `AppContext` provides `user`, `assignments` and actions
- `hooks/`: Encapsulated UI logic (`useAssignments`, `useAssignmentUI`, `useAssignmentPersistence`)
- `utils/`: Storage helpers and assignment utilities

## Data Model

An `assignment` has shape:

```ts
{
  assignmentId: string,
  title: string,
  description?: string,
  professorId?: string,
  professorName?: string,
  dueDate: string,            // YYYY-MM-DD
  driveTemplateLink?: string, // Google Drive folder/file link
  studentsAssigned: string[], // student IDs (e.g., "S101")
  submissions: Array<{
    studentId: string,
    status: 'pending' | 'completed',
    submittedOn: string | null // ISO date or YYYY-MM-DD
  }>
}
```

Users are seeded from `students.json` and `professors.json`. Logged-in user is stored under `loggedInUser` in localStorage.

## Data Flow

1. On first run, `storage.initializeData()` seeds localStorage with `/src/data/*.json` if not already present.
2. `AppContext` reads `assignments` from localStorage and exposes actions to update them.
3. `Login` authenticates against the seeded users and sets `loggedInUser` in context + localStorage.
4. `StudentDashboard` uses `useAssignments()` (scoped by `:studentId` route param) to derive the current student’s assignments and submission status.
5. `ProfessorDashboard` filters assignments by `professorId`, provides CRUD operations via `useAssignmentPersistence()`.

## Role-Based Access

- Routes include `/student/:studentId` and `/professor/:professorId`.
- Pages guard against missing `loggedInUser` and redirect to `/`.
- Student views filter by `studentsAssigned` and `submissions` for that `studentId`.
- Professor views filter by `professorId` on each assignment and show per‑student rows.

## Submission Flow (Double Verification)

1. Student clicks "Submit" on `StudentAssignmentCard` → opens `SubmissionModal`.
2. Modal presents steps and requires a final confirmation click.
3. On confirm, `useAssignmentUI.handleSubmit()` calls context `updateAssignment(studentId, assignmentId)`.
4. Context updates the correct `submission` record to `completed` and sets `submittedOn = new Date().toISOString()`.
5. `saveAssignments()` persists to localStorage; UI updates instantly.

## Responsiveness

- Tailwind utility classes provide responsive layout (`sm`, `md`, `lg` breakpoints) and adaptive card/grid patterns.
- Student and Professor lists stack on mobile and expand into multi‑column layouts on desktop.

## Error Handling & Edge Cases

- Attempted access without `loggedInUser` redirects to `/`.
- Missing/empty `studentsAssigned` produces a friendly empty state.
- Late submissions show as "Past due"; submissions compute days remaining.
- All localStorage reads guard with `|| []` to avoid nulls.

## Extensibility

- Replace localStorage with an API layer without changing most UI; keep the context method signatures.
- Add courses/sections by extending the assignment model and filter hooks.
- The UI primitives in `components/ui` can be swapped or themed.
