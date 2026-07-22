# Architecture

## Overview

```
┌──────────────┐   HTTPS + JWT + X-Correlation-Id   ┌──────────────────┐
│  frontend    │ ─────────────────────────────────▶ │  backend         │
│  Expo (RN)   │                                     │  Spring Boot 4.1 │
│  Expo Router │ ◀───────────── JSON / Problem+JSON ─│  Java 21         │
└──────┬───────┘                                     └───┬──────────┬───┘
       │ Google sign-in (idToken)                        │          │
       │                                          JPA/Flyway      Spring Cache
       ▼                                                 ▼          ▼
   @react-native-google-signin                       Neon       Upstash
                                                    (Postgres)   (Redis)

   backend ──HTTP (X-Correlation-Id)──▶ ml (FastAPI) ──▶ Hugging Face face models
   Sentry  ◀── errors/traces ── all three services
```

## Services

- **frontend/** — Expo SDK 54 app shell (RN 0.81). Expo Router (file-based), React Query for server state,
  Zustand for auth state, React Hook Form + Zod for forms, axios client with auth + correlation-id
  interceptors, `expo-secure-store` for tokens, `react-native-nfc-manager` for NFC tag reads, Sentry.
- **backend/** — Spring Boot **4.1** single deployable (`com.kev.backend.*` domain packages).
  JPA + Flyway (Neon), Spring Cache (Upstash), JWT resource server, Google/Apple verify, Actuator,
  springdoc OpenAPI, Sentry, RFC 7807 errors.
- **ml/** — FastAPI face service; backend proxies verify calls over HTTP.
- **packages/api-types/** — TypeScript types from backend OpenAPI; consumed by the frontend.

## Auth flow

1. App gets a Google **ID token** via `@react-native-google-signin`.
2. App `POST /api/auth/google { idToken }`.
3. Backend verifies the ID token against Google's JWKS (issuer + audience = our client IDs), upserts
   the `users` row, and returns app-issued **access + refresh JWTs** (HS256).
4. App stores tokens in `expo-secure-store`; the axios client attaches the access token and
   transparently refreshes via `POST /api/auth/refresh` on a 401.

## Cross-service tracing

Every frontend request generates an `X-Correlation-Id`. The backend `CorrelationIdFilter` puts it on
the SLF4J MDC (so it appears on every log line) and echoes it back; the same header is forwarded to the
ml service. Combined with Sentry in all three services, a single user action is traceable end-to-end.

## Key decisions

| Decision   | Choice                      | Why                                                          |
| ---------- | --------------------------- | ------------------------------------------------------------ |
| Monorepo   | npm workspaces + Turborepo  | One repo, cached/parallel/affected-only tasks                |
| Navigation | Expo Router                 | 2026 default; file-based, typed routes, deep links           |
| Auth       | Google → app JWT            | Mobile-friendly, stateless; no server sessions               |
| DB         | Neon (serverless Postgres)  | Managed, scales to zero; pooled connection string            |
| Cache      | Upstash (Redis, TLS)        | Managed, serverless Redis                                    |
| ML         | Separate FastAPI service    | HF models live naturally in Python; isolated from the API    |
| Migrations | Flyway (Hibernate validate) | Explicit, versioned schema; never mutate released migrations |

## Domain (build phase — implemented)

- **Directory (UITS mock)**: pluggable `UniversityDirectory` interface; the seeded mock
  (`directory_students`, Redis-cached) simulates the university database and reports
  photo, enrollment and fees status per index number. Swap the implementation via
  `KEV_DIRECTORY_PROVIDER` when a real UITS integration lands.
- **Sessions & attendance**: exam sessions created via Room Setup (join by `KEV-XXXX`
  code); one live attendance row per (session, student) with check-in / remove / restore
  and per-method stats (NFC | QR | MANUAL | FACE).
- **Auth**: sign-in only — accounts are pre-provisioned (seeded admin + lecturer) or
  linked on first Google/Apple sign-in. Email+password, Google ID token, and Apple
  identity token all mint the same app JWTs. Admin assignment of invigilators is
  plan-gated (FREE caps at 5; PREMIUM unlimited → 403 `plan-limit` ProblemDetail).
- **Face verification**: `ml/` runs InsightFace buffalo_sc on onnxruntime (CPU);
  backend proxies `POST /api/verify/face` (probe image + index number) to it.
- **Frontend**: Expo SDK 54 (Expo Go-capable), expo-router tabs, theme tokens
  (#3E97B0 / #416363 / #EDFFF8), liquid-glass surfaces with blur/solid fallbacks,
  NFC scan state machine gated by runtime capabilities (camera QR + manual entry in
  Expo Go).
