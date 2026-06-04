# Contributing

## Setup

```bash
nvm use            # Node 22 (see .nvmrc)
npm install        # installs JS workspaces + sets up Husky hooks
```

Backend needs JDK 21; ML needs uv (see [README](../README.md#prerequisites)).

## Daily loop

```bash
npm run dev                 # all services
npm run lint && npm run typecheck && npm test   # JS checks
npm run backend:test        # backend (./mvnw verify)
npm run ml:test             # ml (pytest)
```

## Commits — Conventional Commits

`type(scope): subject` — enforced by the `commit-msg` hook (commitlint).

- **types**: feat, fix, refactor, perf, test, docs, build, ci, chore, revert
- **scopes**: root, frontend, backend, ml, api-types, ci, deps, docs, release, security

Examples: `feat(frontend): add room-setup screen`, `fix(backend): handle expired refresh token`.

## Git hooks (Husky)

- **pre-commit**: `lint-staged` (Prettier on staged JS/JSON/MD/YAML) + gitleaks secret scan (if installed).
- **commit-msg**: commitlint.

Hooks are intentionally fast; full lint/typecheck/test run via Turbo and in CI.

## Formatting & linting

| Area   | Tool                             | Fix command                                                  |
| ------ | -------------------------------- | ------------------------------------------------------------ |
| JS/TS  | ESLint + Prettier                | `npm run format` · `cd frontend && npx expo lint`            |
| Java   | Spotless (Palantir) + Checkstyle | `cd backend && ./mvnw spotless:apply`                        |
| Python | Ruff (lint+format) + mypy        | `cd ml && uv run ruff check --fix . && uv run ruff format .` |

Run `cd backend && ./mvnw spotless:apply` before committing Java — CI runs `spotless:check`.

## Pull requests

CI is path-filtered: only the changed service's job runs. A PR is mergeable when CI is green
(lint/typecheck/test per service, Spotless + `mvn verify` + JaCoCo, ruff/mypy/pytest) and CodeQL /
dependency-review / gitleaks pass. Keep PRs focused; update docs and tests with the change.

## Adding dependencies

- Frontend: `cd frontend && npx expo install <pkg>` (SDK-matched). Pure-JS deps from the **repo root**
  with `npm install <pkg> --workspace frontend` (avoids an npm workspaces bug when run inside the child).
- Backend: add to `backend/pom.xml` (prefer versions managed by the Spring Boot BOM).
- ML: `cd ml && uv add <pkg>` (`uv add --dev <pkg>` for dev tools).
