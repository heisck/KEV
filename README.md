# KEV

Campus/exam mobile app — a polyglot monorepo: **Expo** (React Native) frontend, **Spring Boot**
backend, and a **Python/FastAPI** ML service for Hugging Face face models.

> Status: **project setup / scaffold**. Foundational wiring is in place (auth, providers, typed API
> client, NFC, observability, CI). Feature UI is intentionally **not** built yet. Agents: read
> [AGENTS.md](./AGENTS.md) first.

## Structure

```
frontend/            Expo SDK 56 + TS + Expo Router (mobile app shell)
backend/             Spring Boot 4.0 + Java 21 (REST API)
ml/                  Python 3.12 + FastAPI + Hugging Face (uv) — face model stub
packages/api-types/  TS types generated from the backend OpenAPI schema
ui-mockup-html/  Design reference only — not part of the build
.github/workflows/   CI (path-filtered per service) + CodeQL / gitleaks / dependency-review
```

## Prerequisites

- **Node 22** + npm 10 (`.nvmrc`)
- **JDK 21** (Temurin) — backend. `winget install EclipseAdoptium.Temurin.21.JDK`
- **uv** — ML service. `winget install astral-sh.uv`
- **Docker** (optional locally) — required for backend Testcontainers integration tests and k6; CI provides it.

## Quick start

```bash
npm install                       # bootstrap the workspace + git hooks

# Configure env (never commit real values)
cp .env.example .env              # master reference
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env   # or export the SPRING_* / UPSTASH_* / GOOGLE_* vars
cp ml/.env.example ml/.env

npm run dev                       # run frontend + backend + ml together
```

- Frontend: Expo dev server (press `a`/`i`; native Google sign-in & NFC need a dev build, not Expo Go).
- Backend: http://localhost:8080 — health `GET /api/health`, Swagger UI `/swagger-ui.html`.
- ML: http://localhost:8000 — health `GET /health`.

## Common commands

| Task                 | Command                                                               |
| -------------------- | --------------------------------------------------------------------- |
| Lint everything (JS) | `npm run lint`                                                        |
| Typecheck (JS)       | `npm run typecheck`                                                   |
| Test (JS)            | `npm test`                                                            |
| Backend build + test | `npm run backend:test` (`./mvnw verify`)                              |
| Backend format       | `cd backend && ./mvnw spotless:apply`                                 |
| ML test/lint/types   | `npm run ml:test` · `cd ml && uv run ruff check . && uv run mypy app` |
| Regenerate API types | `npm run gen:api-types` (backend must be running)                     |
| Load test            | `k6 run backend/load/smoke.js`                                        |
| Backend benchmark    | `cd backend && ./mvnw -Pjmh test-compile exec:java`                   |

## Stack highlights

- **Monorepo**: npm workspaces + Turborepo (cached, parallel, affected-only tasks).
- **Auth**: Google ID token → verified server-side → app-issued JWT (access + refresh), stored in `expo-secure-store`.
- **Data**: Neon (serverless Postgres) via JPA + Flyway; Upstash (Redis) cache.
- **Observability**: Sentry across all three services + `X-Correlation-Id` propagated frontend → backend → ml.
- **Quality/security**: ESLint + Prettier + Spotless + Ruff/mypy, Jest + JUnit + pytest, Testcontainers,
  k6 + JMH, gitleaks, CodeQL, Dependabot, OWASP dependency-check, JaCoCo, Husky + Conventional Commits.

## Docs

[Architecture](docs/ARCHITECTURE.md) · [Environment](docs/ENVIRONMENT.md) ·
[Contributing](docs/CONTRIBUTING.md) · [Security](docs/SECURITY.md)

## Notes

- Windows is the primary dev OS here; npm scripts are cross-platform via small Node launchers in `scripts/`.
- Known follow-up: the Sentry Spring Boot starter (8.0.0) logs an "incompatible Boot version" warning on Boot 4 but still functions; bump when a Boot-4-aware release is pinned.
