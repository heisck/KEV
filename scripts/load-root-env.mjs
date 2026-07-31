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

/**
 * Accept a Neon connection string pasted verbatim from the console
 * (`postgresql://user:pass@ep-x-pooler.../neondb?sslmode=require&channel_binding=require`)
 * and split it into the `jdbc:` URL + username/password Spring expects. Credentials
 * embedded in the URI win over the separate vars, so one paste is enough. Already-JDBC
 * URLs pass through untouched. `channel_binding` is libpq-only and pgjdbc rejects it.
 * @param {Record<string, string>} env mutated in place
 * @returns {Record<string, string>}
 */
export function normalizeDatasource(env) {
  const raw = env.SPRING_DATASOURCE_URL ?? '';
  if (!/^postgres(ql)?:\/\//.test(raw)) return env;
  const uri = new URL(raw);
  if (uri.username) env.SPRING_DATASOURCE_USERNAME = decodeURIComponent(uri.username);
  if (uri.password) env.SPRING_DATASOURCE_PASSWORD = decodeURIComponent(uri.password);
  uri.searchParams.delete('channel_binding');
  if (!uri.searchParams.has('sslmode')) uri.searchParams.set('sslmode', 'require');
  const query = uri.searchParams.toString();
  env.SPRING_DATASOURCE_URL = `jdbc:postgresql://${uri.host}${uri.pathname}${query ? `?${query}` : ''}`;
  return env;
}

/**
 * Merge root `.env` with an optional service-local `.env` (local wins).
 * @param {string} [localEnvFile] absolute path to a service-local `.env`
 * @returns {Record<string, string>}
 */
export function loadEnv(localEnvFile) {
  const root = parseDotEnv(join(repoRoot, '.env'));
  const local = localEnvFile ? parseDotEnv(localEnvFile) : {};
  return normalizeDatasource({ ...root, ...local });
}
