# Security

## Secret management

- **No secrets in git.** Only `*.env.example` files (placeholders) are tracked. Real values live in
  local `.env` files (git-ignored), GitHub Actions secrets, EAS secrets, and host env.
- `.gitleaks.toml` allow-lists only the example placeholders. Gitleaks runs **pre-commit** and **in CI**.
- Mobile tokens are stored in `expo-secure-store` (iOS Keychain / Android Keystore), never in plaintext.

## Automated scanning

| Layer              | Tool                                             | Where                                                      |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| Secret scanning    | gitleaks                                         | pre-commit hook + `gitleaks.yml`                           |
| SAST               | CodeQL (JS/TS, Java, Python)                     | `codeql.yml` (push/PR/weekly)                              |
| Dependency review  | dependency-review-action                         | `dependency-review.yml` (PRs)                              |
| Dependency updates | Dependabot                                       | `.github/dependabot.yml` (npm, maven, uv, actions, docker) |
| Vulnerabilities    | `npm audit`, OWASP dependency-check, `pip-audit` | CI / `./mvnw -Psecurity verify`                            |
| Unused code/deps   | knip                                             | `npm run knip`                                             |

## AuthN / AuthZ

- Google ID tokens are verified server-side against Google's JWKS (issuer + audience pinned to our client IDs).
- App access/refresh JWTs are HS256-signed with `JWT_SECRET` (≥ 32 bytes) and validated by the OAuth2 resource server.
- Endpoints are deny-by-default (`anyRequest().authenticated()`); only health, auth, docs, and select
  actuator endpoints are public. Don't add `permitAll()` routes or widen CORS without review.

## Data & transport

- All managed services use TLS (Neon `sslmode=require`, Upstash TLS).
- JPA parameterizes all queries — never build SQL by string concatenation.
- Errors are returned as RFC 7807 Problem Details with no stack traces or internal details.

## Reporting a vulnerability

Email the maintainer privately (do **not** open a public issue) with steps to reproduce. We'll
acknowledge and coordinate a fix and disclosure.
