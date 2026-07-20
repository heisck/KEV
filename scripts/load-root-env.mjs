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
 * Merge root `.env` with an optional service-local `.env` (local wins).
 * @param {string} [localEnvFile] absolute path to a service-local `.env`
 * @returns {Record<string, string>}
 */
export function loadEnv(localEnvFile) {
  const root = parseDotEnv(join(repoRoot, '.env'));
  const local = localEnvFile ? parseDotEnv(localEnvFile) : {};
  return { ...root, ...local };
}
