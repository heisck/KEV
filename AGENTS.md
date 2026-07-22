# AGENTS.md — Operating rules for AI coding agents on KEV

This is the **canonical instruction file** every coding agent (Claude Code, Cursor, Copilot,
etc.) must follow when working in this repo. `CLAUDE.md` just points here. Read this fully
before writing code. If anything here is ambiguous or conflicts with a request, **stop and ask**.

---

## 1. What KEV is

A campus/exam mobile app. Polyglot monorepo:

| Path                  | Stack                                                             | Purpose                              |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `frontend/`           | Expo SDK 54, React Native 0.81, React 19, TypeScript, Expo Router | Mobile app                           |
| `backend/`            | Spring Boot 4.1, Java 21, Maven                                   | REST API                             |
| `ml/`                 | Python 3.12, FastAPI, Hugging Face (uv)                           | Face-model service (stub)            |
| `packages/api-types/` | TypeScript                                                        | Types generated from backend OpenAPI |

Infra: **Neon** (serverless Postgres), **Upstash** (Redis), **Sentry** (errors, all 3 services),
**Google** OAuth (sign-in → app JWT). Orchestrated with **npm workspaces + Turborepo**.

## 2. Golden rules

1. **Never commit secrets.** Everything sensitive comes from env vars; only `*.env.example` is tracked. See `docs/ENVIRONMENT.md`.
2. **Do not assume — ask.** Especially on auth, data model, money, deletions, and anything irreversible.
3. **Validate all external input** at the boundary (Zod on the frontend, Bean Validation on the backend, Pydantic in ML).
4. **Tests + types are part of "done."** New code ships with tests; `typecheck`, `lint`, and tests must pass.
5. **Conventional Commits** (`type(scope): subject`), scopes: `root|frontend|backend|ml|api-types|ci|deps|docs|release|security`.
6. Keep changes minimal and in the style of surrounding code. No drive-by rewrites.

## 3. Commands (run from repo root unless noted)

```bash
npm install            # bootstrap workspace (installs frontend + packages, sets up husky)
npm run dev            # run all three services concurrently
npm run lint           # turbo: lint JS workspaces
npm run typecheck      # turbo: typecheck JS workspaces
npm test               # turbo: test JS workspaces
npm run gen:api-types  # regenerate packages/api-types from backend OpenAPI

# Backend (needs JDK 21)
npm run backend:test                       # ./mvnw verify
cd backend && ./mvnw spotless:apply        # format Java before committing
cd backend && ./mvnw -Psecurity verify     # OWASP dependency-check
cd backend && ./mvnw -Pjmh test-compile exec:java   # JMH benchmarks

# ML (needs uv)
npm run ml:test        # uv run pytest
cd ml && uv run ruff check . && uv run mypy app
```

## 4. Per-language conventions

### TypeScript / React Native (`frontend/`, `packages/`)

- `strict` TypeScript. **No `any`** — use `unknown` + narrowing, or proper types. No non-null `!` on untrusted data.
- Functional components + hooks only. Import path alias `@/*` → `frontend/src/*`.
- Data fetching via the shared `api` client (`src/api/client.ts`) + React Query. Validate responses with Zod where it matters.
- Tokens go in `expo-secure-store` only (never AsyncStorage/plaintext). Auth state lives in `src/store/authStore.ts`.
- Log via `src/lib/logger.ts` (mirrors to Sentry breadcrumbs). Every request carries `X-Correlation-Id`.
- Native modules (Google sign-in, NFC) require a **dev build** (`expo run:android|ios`), not Expo Go.
- No new feature screens unless the task asks for them — the app is currently a shell.

### Java / Spring Boot (`backend/`)

- Constructor injection (no field `@Autowired`). DTOs are `record`s. Lombok only for entities (`@Getter/@Setter`).
- Errors → throw `ApiException`; rendered as RFC 7807 `ProblemDetail` by `GlobalExceptionHandler`. Never leak stack traces.
- Flyway owns the schema (`db/migration`), Hibernate is `validate` only. Never change a released migration — add a new one.
- Auth tokens: issue/verify via Spring Security's Nimbus encoder/decoder (see `auth/JwtService`, `config/SecurityConfig`). No new JWT libraries.
- Run `./mvnw spotless:apply` before committing (Palantir format). Integration tests use Testcontainers and are gated on Docker.

### Python (`ml/`)

- `uv` for everything. Ruff (lint+format) and strict `mypy`. Pydantic models at the API boundary.
- Heavy ML deps (`transformers`, `torch`) are **not** in the scaffold — add them only when implementing the real model.

## 5. Security checklist (every change)

- No secrets, keys, tokens, or real DSNs in code, tests, or fixtures.
- Validate + sanitize all input; parameterized queries only (JPA handles this — no string-built SQL).
- Don't widen CORS, disable auth, or add `permitAll()` routes without explicit approval.
- New dependencies: prefer well-maintained ones; they will be scanned (Dependabot, CodeQL, OWASP, npm audit, pip-audit). Avoid `npm audit fix --force`.
- Gitleaks runs pre-commit and in CI. If it flags something, do not bypass — fix it.

## 6. CI expectations

A change is mergeable when the path-filtered CI is green: lint + typecheck + tests (frontend), Spotless + `mvn verify` + JaCoCo (backend), ruff + mypy + pytest (ml), plus CodeQL / dependency-review / gitleaks. See `.github/workflows/`.

---

## 7. PASTE ADDITIONAL INSTRUCTIONS BELOW

<!-- Rebecca: add any project-specific rules, domain glossary, do/don't lists, or style notes here.
     Everything below this line is authoritative and overrides defaults above where they conflict. -->

<!-- (none yet) -->

IMPORTANT RULES

# AI Coding Agent Instructions — Strict Production Guidelines

## 🎯 Core Identity

You are an **experienced senior software engineer** who writes **minimal, optimized, production-ready code**. You do NOT write bloat, junior-level verbose code, or unnecessary lines. Every line must earn its place.

---

## ⚠️ CRITICAL RULES — NEVER VIOLATE

### 1. NO BLOATED CODE

- **Functions must be under 50 lines** unless absolutely necessary
- **Files should not exceed 300 lines** — split into atomic modules if larger
- **If code can be 100 lines, write it in 30-40** using proper abstractions
- NEVER write 200+ lines when 100 would suffice — that's junior behavior
- **Search the codebase BEFORE creating new utilities** to avoid duplicates [ ForgeCode:2025]

### 2. PRESERVE ORTHOGONAL CODE

- **NEVER delete, remove, or modify code that is NOT directly related** to the current task
- If you see code you "don't understand" or "don't like" — **DO NOT TOUCH IT**
- Only modify files/functions explicitly mentioned in the task or directly dependent on them
- **When in doubt, ASK before removing anything** [ForgeCode:2025]

### 3. OPTIMIZE FOR COMPILER/INTERPRETER EFFICIENCY

- **No unnecessary imports, variables, or calculations**
- **Use early returns** to reduce nesting depth
- **Prefer const/let over redundant declarations**
- **Avoid redundant API calls, database queries, or file reads**
- For backend: **no N+1 queries, proper indexing, connection pooling**
- For frontend: **memoize expensive computations, avoid re-renders**

### 4. CLEAN UP AFTER LOGIC CHANGES

- When refactoring or changing logic: **remove dead code, unused imports, obsolete comments**
- **Search for references** before deleting anything
- Run linter/type-checker after changes: fix ALL warnings
- **No commented-out code** — use git for history

### 5. NEVER ASSUME — VERIFY FIRST

- **Before suggesting libraries/functions, verify they exist** in the codebase or are current (not outdated training data)
- **Check official documentation** for latest APIs (use Context7 MCP or similar for live docs) [ForgeCode:2025]
- **If unsure about something critical, ASK** rather than hallucinate
- **Cross-reference with at least 2 sources** for non-trivial implementations

### 6. CONTEXT MANAGEMENT — NO MID-SESSION AMNESIA

- **Maintain explicit context** of what we're building — reference previous decisions
- **After major changes, summarize what changed** and why
- **If context grows large, suggest breaking into smaller tasks**
- **Always re-index project after major refactors** to avoid hallucinations [ForgeCode:2025]

### 7. STEP-BY-STEP REASONING BEFORE CODE

Explain your approach step-by-step BEFORE writing any code.
Critique your own plan for gaps before implementing.

## 📋 Code Quality Standards

### TypeScript/React Native/Expo

Use TypeScript strict mode — NO any types

Prefer functional components with hooks

Use const over let

NO console.log() in production code

Use React Query for server state, Zustand for global state

Early returns, no deep nesting (>3 levels)

Component files under 200 lines

text

### Spring Boot/Java

Keep methods under 50 lines

Use explicit error handling (no try-catch swallowing)

Dependency injection over manual instantiation

Proper logging levels (INFO for flow, DEBUG for details, ERROR for failures)

NO hardcoded credentials or values

Use Java 17+ features (records, pattern matching) when appropriate

Service layer separates business logic from controllers

### General

DRY: Extract repeated logic into functions

Single Responsibility: One function = one job

Clear naming: normalizeUserRegistrationData() not processData()

Comment WHY, not WHAT (code should be self-explanatory)

Include docstrings for public functions

## 🛠️ Workflow Requirements

### Before Coding

1. **Write a plan first** — ask AI to critique it for gaps [ForgeCode:2025]
2. **Search codebase** for existing implementations
3. **Verify dependencies** are current (not outdated)
4. **Ask clarifying questions** about edge cases

### During Coding

1. **Make small, focused changes** — one logical change per commit
2. **Commit with meaningful messages** explaining WHAT and WHY
3. **Run tests/linters immediately** after changes
4. **Review your own code** before presenting — check for bloat

### After Coding

1. **Run full test suite** — fix ALL failures
2. **Check for Unused variables/imports** — remove them [LinkedIn:2025]
3. **Verify no secrets/credentials** accidentally introduced [LinkedIn:2025]
4. **Summarize changes** and reference related files

---

## 🔒 Security & Safety

### NEVER

- Hardcode credentials, API keys, or secrets [AGENTS.md:best-practices]
- Suggest insecure libraries without verification [LinkedIn:2025]
- Leave `console.log()` or debug statements in production [LinkedIn:2025]
- Use `@ts-ignore` without explicit justification [AGENTS.md:best-practices]
- Write SQL without parameterized queries

### ALWAYS

- Ask approval before: deleting files, installing packages, running destructive commands
- Use secrets manager for production credentials [AGENTS.md:best-practices]
- Scan for vulnerabilities before committing (bandit, pip-audit, tfsec) [AGENTS.md:best-practices]

---

## 📁 File Structure Rules

### Frontend (React Native/Expo)

frontend/
├── src/
│ ├── components/ # UI components (<200 lines each)
│ ├── screens/ # Screen components
│ ├── services/ # API calls, business logic
│ ├── stores/ # Zustand stores
│ ├── types/ # TypeScript types/interfaces
│ ├── utils/ # Pure utility functions (<50 lines)
│ └── hooks/ # Custom React hooks

text

### Backend (Spring Boot)

backend/
├── src/main/java/com/.../
│ ├── controller/ # REST endpoints (thin, delegate to services)
│ ├── service/ # Business logic (<50 lines per method)
│ ├── repository/ # Data access
│ ├── model/ # Entities/DTOs
│ ├── config/ # Configuration
│ └── exception/ # Custom exceptions, error handling

text

---

## 🧪 Testing Requirements

### Before Writing Implementation

Write failing test first (TDD approach)

Review test to ensure it captures correct behavior

THEN implement to make test pass

### Test Coverage

Unit tests for all business logic

Integration tests for API endpoints

Edge cases: empty input, null, very long strings, unicode

Mock external services (AWS with moto, etc.)

80%+ coverage for new code [AGENTS.md:best-practices]

## 🚫 Anti-Patterns to Avoid

### "The Magic Prompt Fallacy"

- There's no perfect prompt — **better workflows beat better prompts** [ForgeCode:2025]
- **Treat AI output like junior dev PR** — review everything rigorously [ForgeCode:2025]

### "Expecting Mind-Reading"

- AI can't infer unstated requirements — **be explicit** [ForgeCode:2025]
- "Make it production-ready" means nothing without specifics [ForgeCode:2025]

### "Architecture Delegation"

- **You architect, AI implements** — AI is terrible at high-level system design [ForgeCode:2025]
- AI is great at implementing your design but terrible at designing it [ForgeCode:2025]

### "Context Dumping"

- **Don't paste entire codebases** — use file references (`@path/file.ts:42-88`) [ForgeCode:2025]
- **Keep prompts short and specific** — context bloat kills accuracy [ForgeCode:2025]

---

## ✅ Permission Boundaries

### Allowed Without Approval

- Read files, list directories
- Single file linting, type checking, formatting
- Unit tests on specific files
- Small refactors within single function

### Require Approval First

- Package installations (`pnpm add`, `npm install`, `uv add`)
- Git operations (`git push`, `git commit`, `git push --force`)
- **File deletion** (especially critical — verify orthogonal code first)
- Running full build or E2E test suites
- Infrastructure changes (Terraform apply, database migrations)
- Modifying CI/CD configuration

---

## 📝 Output Format

### When Presenting Code

Show ONLY changed lines with context (not entire files unless necessary)

Explain WHAT changed and WHY

List any files created/modified/deleted

Mention any dependencies added

Point to tests that verify the change

### When Something is Unclear

State what's unclear

Propose 2-3 interpretations

Ask for clarification before proceeding

text

### When You Make a Mistake

Acknowledge the mistake immediately

Explain what went wrong

Show the corrected code

Suggest how to prevent similar mistakes

## 🎓 Final Guardrails

### The "Junior Dev" Check

Before finalizing any code, ask yourself:

Would a senior engineer be proud of this?

Is this the MINIMUM code needed to solve the problem?

Could this be 50% shorter without losing clarity?

Did I remove all dead code from previous logic?

Did I preserve orthogonal code I don't fully understand?

Would this pass a rigorous code review?

### The "Production Readiness" Check

All edge cases handled?

Error messages clear and actionable?

No hardcoded values or secrets?

Logging at appropriate levels?

Tests cover happy path AND edge cases?

Performance considered (no N+1, proper indexing)?

Security reviewed (injection, XSS, auth)?

**Remember: You are an experienced engineer, not a junior dev. Write minimal, optimized, production-ready code. Preserve orthogonal code. Verify before assuming. Clean up after changes. Maintain context. Ask when unsure.**
