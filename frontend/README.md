# KEV Frontend

Expo SDK 54 + React Native 0.81 + TypeScript app using **Expo Router** (file-based routes in
`src/app/`). Part of the KEV monorepo — see the [root README](../README.md) and [AGENTS.md](../AGENTS.md).

## Run

```bash
# From the repo root — all three services together (no Expo QR/keypress UI):
npm run dev

# Frontend only — this is what gives you the Expo QR code + a/i/r menu:
npm run dev:frontend        # or: npx expo start (from this dir)
```

> Native modules (Google sign-in, NFC) require a **dev build**, not Expo Go:
> `npx expo run:android` / `npx expo run:ios`.

## Environment

No `frontend/.env` needed. The **single root `.env`** is the source of truth; `app.config.ts`
loads it and surfaces `EXPO_PUBLIC_*` values through `extra` (read in `src/config/env.ts`).
Copy `../.env.example` → `../.env` at the repo root and fill it in. Only `EXPO_PUBLIC_*`
values are bundled into the app.

Key var: `EXPO_PUBLIC_API_URL` (backend base URL). Android emulator → `http://10.0.2.2:8080`;
physical device → your machine's LAN IP.

## Test / lint / typecheck

```bash
npm run typecheck           # tsc --noEmit
npm run lint                # expo lint
npm test                    # jest
```
