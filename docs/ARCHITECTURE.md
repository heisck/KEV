# Architecture

## Overview

```
┌──────────────┐   HTTPS + JWT + X-Correlation-Id   ┌──────────────────┐
│  frontend    │ ─────────────────────────────────▶ │  backend         │
│  Expo (RN)   │                                     │  Spring Boot 4   │
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

- **frontend/** — Expo SDK 56 app shell. Expo Router (file-based), React Query for server state,
  Zustand for auth state, React Hook Form + Zod for forms, axios client with auth + correlation-id
  interceptors, `expo-secure-store` for tokens, `react-native-nfc-manager` for NFC tag reads, Sentry.
- **backend/** — Spring Boot 4 REST API. JPA + Flyway against Neon, Spring Cache against Upstash,
  Spring Security resource server for app JWTs, Google ID-token verification, Actuator + Prometheus,
  springdoc OpenAPI, Sentry. RFC 7807 error bodies.
- **ml/** — FastAPI service that will host Hugging Face face models (currently a stub).
- **packages/api-types/** — TypeScript types generated from the backend OpenAPI document; consumed
  by the frontend for an end-to-end typed contract.

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

## Not yet built (by request)

Feature UI (Room Setup and beyond), the production face model, and domain tables beyond `users`. The
HTML mockups in `ui-mockup-html/` are design reference only and are not wired into the app.
