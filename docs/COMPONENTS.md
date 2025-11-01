# Component Structure & Design Decisions

This document highlights key components and why they exist.

## Shared Components

- `AppHeader`: Consistent top bar with user info and logout. Keeps page headers cohesive.
- `AssignmentStats`: Simple stat cards + an overall progress bar (Radix Progress) to quickly scan progress.
- `StatusPill`: Reusable badge to ensure consistent colors and text for statuses.
- `SubmissionModal`: Double‑verification UX for student submissions (confirm → final confirm), reinforcing intent.
- `Toast`, `SubmissionSuccessToast`, `LoadingButton`: Feedback primitives for a responsive feel.

## Student Components

- `StudentAssignmentHeader`: Section header and count context.
- `StudentAssignmentList`: Responsible only for iterating and rendering cards; accepts a render prop for card, aiding reuse.
- `StudentAssignmentCard`: Core unit of work for students: due date, status, description, Drive link, and Submit button (opens modal).
- `StudentCourseProgress`: High‑level completion bar based on submitted vs total assignments.

## Professor Components

- `ProfessorAssignmentHeader`: Search/sort/create actions for assignments.
- `ProfessorAssignmentList`: Cards with assignment summary (status, due date, counts) and a Details toggle.
- `AssignmentStudentTable`: Expanded view inside each assignment card showing per‑student status, submitted date, and actions.
- `AssignmentModal`: Create/edit form; parses comma/space/newline student IDs and builds/merges `submissions` to preserve status.

## Hooks

- `useAssignments(course?)`: Derives the current student’s assignments, submitted IDs, and provides `submitAssignment(assignmentId)`.
- `useAssignmentUI`: Handles UI micro‑states (loading, success) for submission flow.
- `useAssignmentPersistence`: Encapsulates CRUD for assignments + submission status updates and persistence.
- `useToast`: Small hook for transient messages.

## Context

- `AppContext`: Single global source for `user`, `role`, and `assignments` with `loginUser`, `logout`, and `updateAssignment`.
- Updates are saved immediately to localStorage via `saveAssignments()`.

## Styling & Responsiveness

- Tailwind v4 utilities and design tokens in `src/index.css`.
- Component spacings, typography, and colors aim for clarity and scannability.
- All interactive elements meet minimum touch targets on mobile.

## Design Choices

- Keep data shape simple and colocated (JSON + localStorage) to eliminate backend complexity.
- Favor composition over monoliths: lists render cards; tables render rows; state handled by hooks.
- Double verification before submission minimizes accidental actions and aligns with requirements.
