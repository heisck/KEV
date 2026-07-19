# Environment & secrets

**Never commit real secrets.** Only `*.env.example` files are tracked (and allow-listed in
`.gitleaks.toml`). Locally, copy each `.env.example` to `.env`. In CI/prod, provide values via
GitHub Actions secrets, EAS secrets, and your host's environment.

## Where values come from

| Provider         | Gives you                           | Console                                                                                                                                                     |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Neon**         | Postgres URL, user, password        | neon.tech → project → Connection Details → **Pooled** host (`…-pooler…`, `sslmode=require`). Direct compute endpoints sleep and cause `Connection refused`. |
| **Upstash**      | Redis host, port, password          | upstash.com → Redis database → Details (enable TLS)                                                                                                         |
| **Google Cloud** | OAuth client IDs (web + iOS)        | console.cloud.google.com → APIs & Services → Credentials                                                                                                    |
| **Hugging Face** | Access token                        | huggingface.co → Settings → Access Tokens                                                                                                                   |
| **Sentry**       | DSNs (per service), org, auth token | sentry.io → Project → Client Keys / Auth Tokens                                                                                                             |

## Frontend (`frontend/.env`) — only `EXPO_PUBLIC_*` is bundled

| Var                                                                            | Required | Notes                                              |
| ------------------------------------------------------------------------------ | -------- | -------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`                                                          | yes      | Backend base URL                                   |
| `EXPO_PUBLIC_ENV`                                                              | no       | `development` / `production`                       |
| `EXPO_PUBLIC_SENTRY_DSN`                                                       | no       | Frontend Sentry DSN                                |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`                                             | yes      | Google web client ID (audience the backend checks) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`                                             | iOS      | Google iOS client ID                               |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT_FRONTEND`, `EAS_PROJECT_ID` | build    | EAS / source-map upload only (not bundled)         |

## Backend (`backend/.env` or exported)

| Var                                                 | Required | Notes                               |
| --------------------------------------------------- | -------- | ----------------------------------- |
| `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` | yes      | Neon pooled connection              |
| `UPSTASH_REDIS_HOST` / `_PORT` / `_PASSWORD`        | prod     | Redis; set `UPSTASH_REDIS_SSL=true` |
| `JWT_SECRET`                                        | yes      | ≥ 32 bytes random; signs app JWTs   |
| `JWT_ACCESS_TTL_MINUTES`, `JWT_REFRESH_TTL_DAYS`    | no       | Token lifetimes                     |
| `GOOGLE_CLIENT_IDS`                                 | yes      | Comma-separated accepted audiences  |
| `SENTRY_DSN_BACKEND`                                | no       | Backend Sentry DSN                  |
| `APP_CORS_ALLOWED_ORIGINS`                          | no       | Comma-separated allowed origins     |
| `SPRING_PROFILES_ACTIVE`                            | no       | `dev` / `prod` (defaults to base)   |

## ML (`ml/.env`)

| Var                  | Required  | Notes                     |
| -------------------- | --------- | ------------------------- |
| `HF_TOKEN`           | for model | Hugging Face access token |
| `HF_FACE_MODEL_ID`   | for model | Model repo id             |
| `ML_SENTRY_DSN`      | no        | ML Sentry DSN             |
| `SENTRY_ENVIRONMENT` | no        | Defaults to `development` |
| `ML_PORT`            | no        | Defaults to `8000`        |

## CI / production

- **GitHub Actions**: add the backend/ml secrets under repo Settings → Secrets and variables → Actions.
- **EAS** (mobile builds): `eas secret:create` for `SENTRY_AUTH_TOKEN`, Google client IDs, etc.
- The master reference list lives in the root [`.env.example`](../.env.example).
