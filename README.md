# Team Task Management Hub

A full-stack task management app with React + TypeScript frontend and Node.js + Express backend.

---

## Project Structure

```
task-hub/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── app.ts                  # Express app factory
│   │   ├── index.ts                # Server entry point
│   │   ├── types/index.ts          # Shared types & constants
│   │   ├── store/taskStore.ts      # In-memory data store
│   │   ├── validators/             # Server-side validation
│   │   ├── routes/tasks.ts         # REST endpoints
│   │   └── middleware/errorHandler.ts
│   └── tests/
│       ├── tasks.test.ts           # Integration tests (supertest)
│       ├── validator.test.ts       # Unit tests for validators
│       └── store.test.ts           # Unit tests for TaskStore
│
└── frontend/         # React + TypeScript + Zustand + Zod
    ├── src/
    │   ├── App.tsx                 # Root component
    │   ├── api/client.ts           # Typed API client (with delete header)
    │   ├── store/taskStore.ts      # Zustand global state
    │   ├── hooks/useDebounce.ts    # Debounce hook for search
    │   ├── types/index.ts          # Zod schemas + TS types
    │   └── components/
    │       ├── TaskCard.tsx        # Task display with confirm-delete
    │       ├── TaskForm.tsx        # Create task form with Zod validation
    │       ├── SearchBar.tsx       # Debounced search input
    │       └── StatsBar.tsx        # Task count summary
    └── tests/
        ├── setup.ts
        ├── schemas.test.ts         # Zod schema validation tests
        ├── useDebounce.test.ts     # Hook tests with fake timers
        ├── TaskCard.test.tsx       # Component tests (RTL)
        ├── TaskForm.test.tsx       # Form validation tests (RTL)
        ├── SearchBar.test.tsx      # Search + debounce tests (RTL)
        ├── StatsBar.test.tsx       # Stats component tests
        └── apiClient.test.ts      # API client tests (fetch mock)
```

---

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev          # starts on http://localhost:4000
npm test             # run all backend tests
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173 (proxies /api to :4000)
npm test             # run all frontend tests
```

---

## API Reference

| Method | Endpoint          | Auth Header Required | Description           |
|--------|-------------------|---------------------|-----------------------|
| GET    | /api/tasks        | —                   | List tasks (search: ?search=) |
| GET    | /api/tasks/:id    | —                   | Get task by ID        |
| POST   | /api/tasks        | —                   | Create task           |
| PATCH  | /api/tasks/:id    | —                   | Partial update        |
| DELETE | /api/tasks/:id    | x-delete-authorization: team-delete-secret-2024 | Delete task |

### Task Shape

```json
{
  "id": "uuid",
  "title": "string (1–100 chars, required)",
  "description": "string (0–500 chars)",
  "priority": "low | medium | high | critical",
  "status": "todo | in_progress | done | cancelled",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Consistent Response Envelope

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message", "data": [...validationErrors] }
```

---

## Feature Highlights

### 1. Resilient API
- Global error handler catches all unhandled errors and JSON parse failures
- 404 handler for unknown routes
- Content-Type validation on mutation endpoints
- Consistent `{ success, data?, error?, message? }` envelope on every response

### 2. Dual-layer Validation
- **Server**: hand-written validators in `backend/src/validators/`
- **Client**: Zod schemas in `frontend/src/types/index.ts`
- Both enforce: title required, title ≤ 100 chars, valid priority enum, valid status enum

### 3. Debounced Search
- `useDebounce` hook (300ms) prevents API calls on every keystroke
- Search dispatches to Zustand store → API GET with `?search=`
- Clear button resets to full list

### 4. Protected Delete
- Server checks `x-delete-authorization: team-delete-secret-2024` header
- Missing or wrong header → 403 Forbidden (task is NOT deleted)
- Frontend `api/client.ts` attaches header automatically on every delete call
- UI has two-click confirmation to prevent accidental deletes

### 5. Global State (Zustand)
- Single `useTaskStore` handles all async operations
- Optimistic local update after PATCH (status change)
- Error state displayed in dismissable banner
