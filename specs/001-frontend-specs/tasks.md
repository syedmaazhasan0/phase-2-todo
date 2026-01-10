---

description: "Task list for Frontend Specifications - Todo Full-Stack Web Application"
---

# Tasks: Frontend Specifications for Todo Full-Stack Web Application

**Input**: Design documents from `/specs/001-frontend-specs/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list. Testing will be implemented as a separate phase after MVP is complete.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/` at repository root
- Paths shown below assume `frontend/` as the base directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js 16+ project with TypeScript, Tailwind CSS, ESLint, and App Router in frontend/ directory
- [x] T002 Install Better Auth dependencies: better-auth
- [x] T003 [P] Create .env.local with BETTER_AUTH_SECRET, BETTER_AUTH_URL, and NEXT_PUBLIC_API_URL
- [x] T004 [P] Create .env.example template file with placeholder environment variables
- [x] T005 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [x] T006 [P] Configure Tailwind CSS design system in globals.css with custom colors (primary, success, danger)
- [x] T007 [P] Update ESLint configuration in eslint.config.mjs to enforce no inline styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create TypeScript type definitions in frontend/types/index.ts (Task, User, TaskStatus, TaskSortOption, CreateTaskData, UpdateTaskData, GetTasksParams)
- [x] T009 Create Better Auth configuration in frontend/lib/auth.ts with JWT plugin enabled
- [x] T010 Create Better Auth React provider in frontend/lib/auth-provider.tsx wrapping SessionProvider
- [x] T011 Implement centralized API client base in frontend/lib/api.ts with apiRequest function, JWT token extraction, and 401 redirect logic
- [x] T012 [P] Implement getTasks function in frontend/lib/api.ts for GET /api/tasks with status and sort params
- [x] T013 [P] Implement createTask function in frontend/lib/api.ts for POST /api/tasks
- [x] T014 [P] Implement updateTask function in frontend/lib/api.ts for PUT /api/tasks/{id}
- [x] T015 [P] Implement deleteTask function in frontend/lib/api.ts for DELETE /api/tasks/{id}
- [x] T016 [P] Implement toggleTaskComplete function in frontend/lib/api.ts for PATCH /api/tasks/{id}/complete
- [x] T017 [P] Create LoadingSpinner component in frontend/components/LoadingSpinner.tsx with size variants (sm, md, lg) and fullScreen mode
- [x] T018 [P] Create ErrorMessage component in frontend/components/ErrorMessage.tsx with retry and dismiss callbacks
- [x] T019 [P] Create Modal component in frontend/components/Modal.tsx with focus trap, escape key handling, and backdrop click
- [x] T020 Create root layout in frontend/app/layout.tsx with Better Auth provider, global styles, and metadata
- [x] T021 Create middleware in frontend/middleware.ts for route protection (redirect unauthenticated users to /login, authenticated users away from /login)
- [x] T022 Create global loading UI in frontend/app/loading.tsx using LoadingSpinner component
- [x] T023 Create global error boundary in frontend/app/error.tsx with error display and reset functionality
- [x] T024 Create 404 page in frontend/app/not-found.tsx with navigation back to tasks

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Enable users to sign up, log in, and log out securely with Better Auth JWT

**Independent Test**: A user can successfully sign up with email/password, log in with credentials, and be redirected to their personal dashboard. Logout functionality returns them to the login screen.

### Implementation for User Story 1

- [x] T025 [P] [US1] Create AuthForm component in frontend/components/AuthForm.tsx with login/signup toggle, email/password fields, Better Auth integration
- [x] T026 [P] [US1] Create Navbar component in frontend/components/Navbar.tsx with logo, user name display, and logout button (conditional rendering based on auth state)
- [x] T027 [US1] Create home page in frontend/app/page.tsx that redirects authenticated users to /tasks and unauthenticated to /login
- [x] T028 [US1] Create login page in frontend/app/login/page.tsx with AuthForm component centered on page
- [x] T029 [US1] Update root layout in frontend/app/layout.tsx to conditionally render Navbar when user is authenticated
- [x] T030 [US1] Test authentication flow: signup, login, logout, and route protection work correctly

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Personal Tasks (Priority: P2)

**Goal**: Display authenticated user's tasks with filtering and sorting capabilities

**Independent Test**: An authenticated user can view their personal tasks list, filter by status (All/Pending/Completed), and sort by created date, title, or due date. No other user's tasks are visible.

### Implementation for User Story 2

- [x] T031 [P] [US2] Create TaskCard component in frontend/components/TaskCard.tsx displaying title, truncated description, completion status, created date, with placeholder action buttons
- [x] T032 [US2] Create tasks dashboard server component in frontend/app/tasks/page.tsx with server-side data fetching using getTasks()
- [x] T033 [US2] Create TasksDashboardClient component in frontend/app/tasks/_components/TasksDashboardClient.tsx for filter and sort UI state management
- [x] T034 [US2] Implement status filter dropdown (All/Pending/Completed) in TasksDashboardClient component
- [x] T035 [US2] Implement sort dropdown (Created/Title/Due Date) in TasksDashboardClient component
- [x] T036 [US2] Implement client-side filtering logic based on selected status in TasksDashboardClient component
- [x] T037 [US2] Implement client-side sorting logic based on selected sort option in TasksDashboardClient component
- [x] T038 [US2] Implement empty state UI when no tasks exist or no tasks match filters in TasksDashboardClient component
- [x] T039 [US2] Implement responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop) for task cards in TasksDashboardClient component
- [x] T040 [US2] Test tasks dashboard: tasks display correctly, filtering works, sorting works, empty states appear

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Create New Task (Priority: P3)

**Goal**: Allow users to create new tasks via modal form with validation

**Independent Test**: A user can click "Add New Task", fill in a title (required) and description (optional), submit the form, and see the new task immediately appear in their list.

### Implementation for User Story 3

- [x] T041 [P] [US3] Create TaskForm component in frontend/components/TaskForm.tsx with title/description fields, validation (1-200 chars title, max 1000 desc), mode support (create/edit)
- [x] T042 [US3] Add "Add New Task" button to TasksDashboardClient component with modal state management
- [x] T043 [US3] Integrate Modal component with TaskForm (create mode) in TasksDashboardClient component
- [x] T044 [US3] Implement handleCreateTask function in TasksDashboardClient calling createTask API with loading and error states
- [x] T045 [US3] Update tasks list state to include newly created task without re-fetching from server
- [x] T046 [US3] Implement success message display after task creation (brief toast or inline message)
- [x] T047 [US3] Add client-side validation error display in TaskForm component (title required, character limits)
- [x] T048 [US3] Test task creation: modal opens, validation works, task appears in list, success message shows

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Edit Existing Task (Priority: P4)

**Goal**: Allow users to edit existing tasks via pre-filled modal form

**Independent Test**: A user can click the edit button on any of their tasks, modify the title or description, save changes, and see the updated information reflected immediately.

### Implementation for User Story 4

- [x] T049 [US4] Add edit button to TaskCard component with onEdit callback prop
- [x] T050 [US4] Add edit modal state management (editingTask) to TasksDashboardClient component
- [x] T051 [US4] Integrate Modal component with TaskForm (edit mode) in TasksDashboardClient component with pre-filled data
- [x] T052 [US4] Implement handleEditTask function in TasksDashboardClient calling updateTask API with loading and error states
- [x] T053 [US4] Update tasks list state to reflect edited task without re-fetching from server
- [x] T054 [US4] Implement cancel button behavior in TaskForm closing modal without saving changes
- [x] T055 [US4] Test task editing: edit button opens modal, form pre-fills, validation works, changes reflect immediately

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Toggle Task Completion (Priority: P5)

**Goal**: Allow users to toggle task completion status with optimistic updates

**Independent Test**: A user can click the checkbox on any task to toggle between completed and pending states. The visual state updates immediately and persists across page refreshes.

### Implementation for User Story 5

- [x] T056 [US5] Add checkbox to TaskCard component with checked state based on task.completed
- [x] T057 [US5] Add visual styling for completed tasks in TaskCard component (strikethrough title, muted colors)
- [x] T058 [US5] Implement handleToggleComplete function in TasksDashboardClient with optimistic update pattern
- [x] T059 [US5] Call toggleTaskComplete API in handleToggleComplete with rollback on failure
- [x] T060 [US5] Display error message and revert checkbox state if toggle API call fails
- [x] T061 [US5] Test task toggle: checkbox updates immediately, styling changes, persists across refresh, rolls back on error

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Delete Task (Priority: P6)

**Goal**: Allow users to delete tasks with confirmation dialog

**Independent Test**: A user can click the delete button on any task, confirm the deletion, and see the task immediately removed from their list.

### Implementation for User Story 6

- [x] T062 [US6] Add delete button to TaskCard component with onDelete callback prop
- [x] T063 [US6] Implement confirmation dialog in TasksDashboardClient using Modal component for delete operations
- [x] T064 [US6] Implement handleDeleteTask function in TasksDashboardClient calling deleteTask API with loading state
- [x] T065 [US6] Remove deleted task from tasks list state immediately after successful API response
- [x] T066 [US6] Display brief success message after task deletion ("Task deleted successfully")
- [x] T067 [US6] Test task deletion: delete button shows confirmation, Cancel keeps task, Delete removes task, success message appears

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T068 [P] Add responsive design refinements for mobile (320px-640px) breakpoints across all components
- [x] T069 [P] Add responsive design refinements for tablet (640px-1024px) breakpoints across all components
- [x] T070 [P] Implement date formatting helper (relative time: "2 hours ago", "3 days ago") and apply to TaskCard created_at
- [x] T071 [P] Implement text truncation with ellipsis for long task descriptions in TaskCard (first 100 characters)
- [x] T072 [P] Add loading indicators to all async operations (button spinners, card skeletons) in TasksDashboardClient
- [x] T073 [P] Add smooth transitions and hover states to buttons and cards using Tailwind CSS
- [x] T074 [P] Add focus styles for keyboard navigation across all interactive elements
- [x] T075 Verify no inline styles exist in any component (run ESLint check)
- [x] T076 Test full application flow end-to-end: signup → create tasks → filter/sort → edit/toggle/delete → logout
- [x] T077 [P] Create frontend README.md with setup instructions referencing quickstart.md
- [x] T078 [P] Verify all environment variables are documented in .env.example

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Auth)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - View)**: Can start after Foundational (Phase 2) - Displays tasks but uses placeholder buttons until US3-6 implemented
- **User Story 3 (P3 - Create)**: Can start after Foundational (Phase 2) - Creates tasks that can be viewed by US2
- **User Story 4 (P4 - Edit)**: Depends on US2 TaskCard component - Adds edit functionality to existing cards
- **User Story 5 (P5 - Toggle)**: Depends on US2 TaskCard component - Adds toggle functionality to existing cards
- **User Story 6 (P6 - Delete)**: Depends on US2 TaskCard component - Adds delete functionality to existing cards

**Note**: US4, US5, US6 all modify the TaskCard component created in US2, so they have a soft dependency. However, TaskCard is created with placeholder buttons, so US4-6 can still be implemented independently by different developers.

### Within Each User Story

- Foundational API client functions must be complete before user story work begins
- Components can be built in parallel if they don't depend on each other
- Integration tasks must come after individual components are complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, multiple user stories can be worked on in parallel:
  - Developer A: US1 (Auth) - blocking for protected routes
  - Developer B: US2 (View) + US3 (Create) - can work together
  - After US2 complete:
    - Developer C: US4 (Edit)
    - Developer D: US5 (Toggle)
    - Developer E: US6 (Delete)

---

## Parallel Example: Foundational Phase

```bash
# Launch API client functions together (all in frontend/lib/api.ts):
Task T012: getTasks function
Task T013: createTask function
Task T014: updateTask function
Task T015: deleteTask function
Task T016: toggleTaskComplete function

# Launch UI components together:
Task T017: LoadingSpinner component
Task T018: ErrorMessage component
Task T019: Modal component
```

---

## Parallel Example: User Story 2 (View Tasks)

```bash
# Launch components together (independent components):
Task T031: TaskCard component
Task T033: TasksDashboardClient component

# Then implement filtering/sorting logic in parallel within TasksDashboardClient:
Task T034: Status filter dropdown
Task T035: Sort dropdown
Task T036: Filtering logic
Task T037: Sorting logic
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 + User Story 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. Complete Phase 4: User Story 2 (View Tasks)
5. Complete Phase 5: User Story 3 (Create Tasks)
6. **STOP and VALIDATE**: Test MVP independently
   - User can sign up, log in, view tasks, create new tasks, log out
   - All filtering and sorting works
7. Deploy MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test independently → Deploy/Demo (Auth working!)
3. Add US2 (View) → Test independently → Deploy/Demo (MVP with view!)
4. Add US3 (Create) → Test independently → Deploy/Demo (Full MVP!)
5. Add US4 (Edit) → Test independently → Deploy/Demo
6. Add US5 (Toggle) → Test independently → Deploy/Demo
7. Add US6 (Delete) → Test independently → Deploy/Demo
8. Add Phase 9 (Polish) → Final deploy
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth) - MUST complete first for protected routes
3. After US1 complete:
   - Developer B: User Story 2 (View) + User Story 3 (Create)
   - Developer C: Start UI polish work
4. After US2 complete:
   - Developer D: User Story 4 (Edit)
   - Developer E: User Story 5 (Toggle)
   - Developer F: User Story 6 (Delete)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 17 tasks (BLOCKING)
- **Phase 3 (US1 - Auth)**: 6 tasks
- **Phase 4 (US2 - View)**: 10 tasks
- **Phase 5 (US3 - Create)**: 8 tasks
- **Phase 6 (US4 - Edit)**: 7 tasks
- **Phase 7 (US5 - Toggle)**: 6 tasks
- **Phase 8 (US6 - Delete)**: 6 tasks
- **Phase 9 (Polish)**: 11 tasks

**Total**: 78 tasks

**Parallel Opportunities**: 31 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Tasks T001-T048 (Phases 1-5) deliver fully functional authentication, task viewing, filtering, sorting, and task creation

---

## Format Validation ✅

All tasks follow the required checklist format:
- [x] Every task starts with `- [ ]` checkbox
- [x] Every task has sequential Task ID (T001-T078)
- [x] [P] marker added only for parallelizable tasks
- [x] [Story] label (US1-US6) added for all user story phase tasks
- [x] Every task includes clear action and exact file path
- [x] No setup or polish tasks have story labels (correct)
- [x] All foundational tasks have no story labels (correct)

**Ready for implementation!** 🚀
