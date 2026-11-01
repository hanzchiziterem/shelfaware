# Development & Engineering Guide

## 1. Repository Architecture

Mate POS & Inventory Management is structured as a modular, feature-oriented React + TypeScript application using **CSS Modules** (`*.module.css`) with centralized design tokens (`src/styles/tokens.css`), **Zustand** domain stores (`src/store/*`), **Axios** API services (`src/features/*/services/*Api.ts`), and **React Router** exported route configuration arrays (`src/app/router/*`).

## 2. Conventional Commit Standard

All commits are validated automatically by Husky and Commitlint (`.husky/commit-msg` and `commitlint.config.js`).

### Required Format
```text
type(scope): description
```

### Allowed Commit Types
- `feat`: Backward-compatible feature additions (triggers `minor` release)
- `fix`: Backward-compatible bug fixes (triggers `patch` release)
- `perf`: Performance improvements (triggers `patch` release)
- `refactor`: Code restructuring without changing external behavior
- `docs`: Documentation updates
- `style`: Formatting or CSS adjustments
- `test`: Adding or updating automated tests
- `build`: Build system or dependency changes
- `ci`: Continuous integration workflow updates
- `chore`: Maintenance tasks
- `revert`: Reverting a previous commit

### Allowed Scopes (Required, Lowercase)
- `frontend`: UI, pages, components, and client state
- `backend`: Server-side services and business logic
- `api`: REST API contracts, Axios services, and endpoints
- `web`: Web application configuration and routing
- `shared`: Shared domain types, utilities, and validators
- `root`: Repository-level configuration and tooling
- `docs`: Documentation and API specifications
- `ci`: GitHub Actions and release pipelines

### Breaking Changes
Indicate breaking changes by appending `!` after the `(scope)` (e.g. `feat(api)!: change checkout payload format`) or including a `BREAKING CHANGE:` footer.

## 3. Local Commands

- `npm run dev` — Start the Vite development server on port 3000
- `npm run typecheck` — Run TypeScript compiler validation (`tsc --noEmit`)
- `npm run lint` — Run static type and syntax checks
- `npm run test` — Run the Vitest unit, store, and component test suite
- `npm run build` — Build the production bundle into `dist/`

## 4. Mock vs. Live API Mode

Controlled via `.env` / environment variables:
- `VITE_USE_MOCK_API="true"` (Default): Uses deterministic local mock adapters backed by realistic Nigerian grocery retail data (`src/mocks/*`) and persisted state in `localStorage`.
- `VITE_USE_MOCK_API="false"`: Routes all service calls through the centralized Axios instance (`src/services/api/axiosInstance.ts`) to `VITE_API_BASE_URL` (defaults to `http://localhost:4000/api/v1`).
