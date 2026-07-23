#!/usr/bin/env node
/**
 * Single source of truth for local env: the monorepo-root `.env`.
 *
 * All three services load this first so you maintain ONE file instead of
 * frontend/.env + backend/.env + ml/.env. A service-local `.env` (if present)
 * is layered on top as an override — handy for one-off per-service tweaks —
 * but is never required.
 *
 * Only *.env.example is committed; real `.env` files are gitignored.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Parse a dotenv file into a plain object. Missing file → {}. */
export function parseDotEnv(file) {
  if (!existsSync(file)) return {};
  const vars = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[match[1]] = value;
  }
  return vars;
}

/** Normalize common standard SaaS connection strings and environment variables across all services. */
export function normalizeEnv(vars) {
  const merged = { ...vars };

  // 1. Database (Neon / Postgres standard DATABASE_URL)
  const dbUrl = merged.DATABASE_URL || merged.SPRING_DATASOURCE_URL || process.env.DATABASE_URL || process.env.SPRING_DATASOURCE_URL;
  if (dbUrl) {
    if (!merged.DATABASE_URL) merged.DATABASE_URL = dbUrl;
    try {
      if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
        const parsed = new URL(dbUrl);
        const host = parsed.hostname;
        const port = parsed.port || '5432';
        const dbName = parsed.pathname.replace(/^\//, '') || 'neondb';
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        const defaultSsl = isLocal ? '?sslmode=prefer' : '?sslmode=require';
        const params = parsed.search ? parsed.search : defaultSsl;
        if (!merged.SPRING_DATASOURCE_URL) {
          merged.SPRING_DATASOURCE_URL = `jdbc:postgresql://${host}:${port}/${dbName}${params}`;
        }
        if (parsed.username && !merged.SPRING_DATASOURCE_USERNAME) {
          merged.SPRING_DATASOURCE_USERNAME = decodeURIComponent(parsed.username);
        }
        if (parsed.password && !merged.SPRING_DATASOURCE_PASSWORD) {
          merged.SPRING_DATASOURCE_PASSWORD = decodeURIComponent(parsed.password);
        }
      } else if (dbUrl.startsWith('jdbc:')) {
        if (!merged.SPRING_DATASOURCE_URL) merged.SPRING_DATASOURCE_URL = dbUrl;
      }
    } catch {
      if (!merged.SPRING_DATASOURCE_URL) merged.SPRING_DATASOURCE_URL = dbUrl;
    }
  }

  // 2. Redis (Upstash / Redis standard REDIS_URL)
  const redisUrl = merged.REDIS_URL || merged.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (redisUrl) {
    if (!merged.REDIS_URL) merged.REDIS_URL = redisUrl;
    if (!merged.UPSTASH_REDIS_HOST || merged.UPSTASH_REDIS_HOST === 'localhost') {
      try {
        const isSsl = redisUrl.startsWith('rediss://');
        const parsed = new URL(redisUrl);
        merged.UPSTASH_REDIS_HOST = parsed.hostname;
        merged.UPSTASH_REDIS_PORT = parsed.port || '6379';
        if (parsed.password && !merged.UPSTASH_REDIS_PASSWORD) {
          merged.UPSTASH_REDIS_PASSWORD = decodeURIComponent(parsed.password);
        }
        merged.UPSTASH_REDIS_SSL = isSsl ? 'true' : 'false';
      } catch {
        // Ignore parse failure
      }
    }
  } else if (merged.UPSTASH_REDIS_HOST && merged.UPSTASH_REDIS_HOST !== 'localhost') {
    const proto = merged.UPSTASH_REDIS_SSL === 'true' ? 'rediss' : 'redis';
    const pass = merged.UPSTASH_REDIS_PASSWORD ? `:${encodeURIComponent(merged.UPSTASH_REDIS_PASSWORD)}@` : '';
    const port = merged.UPSTASH_REDIS_PORT || '6379';
    merged.REDIS_URL = `${proto}://default${pass}${merged.UPSTASH_REDIS_HOST}:${port}`;
  }

  // 3. Backend URL standard mapping
  const backendUrl = merged.BACKEND_URL || merged.EXPO_PUBLIC_API_URL || merged.SERVER_URL || process.env.BACKEND_URL;
  if (backendUrl) {
    merged.BACKEND_URL = backendUrl;
    merged.EXPO_PUBLIC_API_URL = backendUrl;
  }

  // 4. Google Client IDs
  const googleWebId = merged.GOOGLE_WEB_CLIENT_ID || merged.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (googleWebId) {
    merged.GOOGLE_WEB_CLIENT_ID = googleWebId;
    merged.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = googleWebId;
    if (!merged.GOOGLE_CLIENT_IDS) merged.GOOGLE_CLIENT_IDS = googleWebId;
  }

  const googleIosId = merged.GOOGLE_IOS_CLIENT_ID || merged.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (googleIosId) {
    merged.GOOGLE_IOS_CLIENT_ID = googleIosId;
    merged.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = googleIosId;
  }

  // 5. Sentry DSN mappings — only pass valid http/https URLs to prevent Spring Boot/FastAPI/Expo crashes on placeholder values
  const frontendSentry = merged.FRONTEND_SENTRY_DSN || merged.EXPO_PUBLIC_SENTRY_DSN;
  if (frontendSentry && (frontendSentry.startsWith('http://') || frontendSentry.startsWith('https://'))) {
    merged.FRONTEND_SENTRY_DSN = frontendSentry;
    merged.EXPO_PUBLIC_SENTRY_DSN = frontendSentry;
  } else {
    delete merged.FRONTEND_SENTRY_DSN;
    delete merged.EXPO_PUBLIC_SENTRY_DSN;
  }

  const backendSentry = merged.BACKEND_SENTRY_DSN || merged.SENTRY_DSN_BACKEND;
  if (backendSentry && (backendSentry.startsWith('http://') || backendSentry.startsWith('https://'))) {
    merged.BACKEND_SENTRY_DSN = backendSentry;
    merged.SENTRY_DSN_BACKEND = backendSentry;
  } else {
    delete merged.BACKEND_SENTRY_DSN;
    delete merged.SENTRY_DSN_BACKEND;
  }

  const mlSentry = merged.ML_SENTRY_DSN;
  if (mlSentry && (mlSentry.startsWith('http://') || mlSentry.startsWith('https://'))) {
    merged.ML_SENTRY_DSN = mlSentry;
  } else {
    delete merged.ML_SENTRY_DSN;
  }

  return merged;
}

/**
 * Merge root `.env` with an optional service-local `.env` (local wins).
 * @param {string} [localEnvFile] absolute path to a service-local `.env`
 * @returns {Record<string, string>}
 */
export function loadEnv(localEnvFile) {
  const root = parseDotEnv(join(repoRoot, '.env'));
  const local = localEnvFile ? parseDotEnv(localEnvFile) : {};
  return normalizeEnv({ ...root, ...local });
}

