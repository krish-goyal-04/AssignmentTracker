# Assignment Tracker

Clean, responsive, role‑based assignment management dashboard built with React, Vite, and Tailwind CSS. Students can view and submit assignments via a double‑verification flow; Professors can create/manage assignments, attach Drive links, and track per‑student progress.

• Live Demo (Vercel): <assignment-tracker-psi.vercel.app>

## Features

- Role‑based experience (Student vs Professor) with URL‑scoped access
- Students: see only their assignments, progress, and submit with a double confirmation modal
- Professors: create/edit/delete assignments, attach Drive template links, and view per‑student status with progress indicators
- Responsive UI using Tailwind CSS and shadcn‑style primitives
- No backend required: data seeded from JSON and persisted to localStorage

## Stack

- React 19, Vite 7
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Router DOM 7
- Framer Motion for micro‑animations

## Getting Started

Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+

Install and run (Windows PowerShell)

```powershell
npm install
npm run dev
```

Demo credentials

- Student: riya@student.com / riya123
- Professor: raj@joineazy.com / raj123

## Architecture Overview

High level

- Pages: `Login`, `StudentDashboard`, `ProfessorDashboard`
- State: `AppContext` holds the logged‑in user and the `assignments` array, persisted via `src/utils/storage.js`
- Hooks: encapsulate UI logic (submission flow, form state, filters) and data selection (per‑student views)
- UI: Component‑based composition with shared building blocks and role‑specific components

Data flow

1. `Login` authenticates against JSON‑seeded users and stores `loggedInUser` in localStorage + context
2. Dashboards read `assignments` from context (seeded from `src/data/*.json` on first load)
3. Students submit via a confirmation modal → context updates submission record → persisted to localStorage
4. Professors create/edit assignments → context persistence updates localStorage

## Folder Structure

```
src/
	components/
		professor/          # Admin UI: create/edit/list and student table
		shared/             # Reusable shared UI (header, stats, pills, toasts, modals)
		student/            # Student UI: cards, lists, progress
		ui/                 # Small styled UI primitives
	context/              # AppContext (user + assignments + actions)
	data/                 # Seed JSON: students, professors, assignments
	hooks/                # UI/data hooks: useAssignments, useAssignmentUI, etc.
	lib/                  # Utilities for styling
	pages/                # Route pages
	utils/                # Storage + assignment utilities
```

## Component Structure & Design Decisions

- Double verification submission: `StudentAssignmentCard` + `SubmissionModal` implement a two‑step confirm before marking submitted.
- Per‑student scoping: `useAssignments` derives a student’s assignments from `assignments` + URL param; no cross‑user leakage.
- Admin progress: `ProfessorAssignmentList` renders counts and detailed `AssignmentStudentTable` with status badges.
- Persistence: `src/utils/storage.js` seeds from JSON once and then reads/writes localStorage; app stays fully client‑side.
- Responsiveness: Tailwind utility classes across components; lists/cards adapt to mobile/desktop grid.

## Notes / Known Behavior

- Data is seeded on first load; subsequent changes persist in browser storage. To reset, clear browser localStorage keys: `assignments`, `students`, `professors`, `loggedInUser`.

## License

MIT (or your chosen license)
