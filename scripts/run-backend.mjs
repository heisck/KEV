#!/usr/bin/env node
/**
 * Cross-platform launcher for the Maven wrapper in backend/.
 * Picks mvnw.cmd on Windows and ./mvnw elsewhere so the same npm
 * scripts work locally (Windows) and in CI (Linux).
 *
 * Loads the root `.env` (single source of truth) into the child environment,
 * with an optional backend/.env layered on top as an override. Spring Boot does
 * not read .env files itself. These values win over the parent process env so a
 * stale SPRING_DATASOURCE_URL in the shell/IDE cannot pin an old Neon host.
 * CI with no .env files still uses process env only.
 *
 *   node scripts/run-backend.mjs spring-boot:run
 *   node scripts/run-backend.mjs verify
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv } from './load-root-env.mjs';
import { ensureDevInfra } from './dev-infra.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = join(root, 'backend');
const isWin = process.platform === 'win32';
const wrapper = join(backendDir, isWin ? 'mvnw.cmd' : 'mvnw');

const dotEnv = loadEnv(join(backendDir, '.env'));
const keys = Object.keys(dotEnv);
if (keys.length > 0) {
  console.log(`[run-backend] env: applying ${keys.length} vars from root .env (+ backend/.env override)`);
}
const jdbc = dotEnv.SPRING_DATASOURCE_URL ?? process.env.SPRING_DATASOURCE_URL ?? '';
if (jdbc.includes('neon.tech') && !jdbc.includes('-pooler')) {
  console.warn(
    '[run-backend] SPRING_DATASOURCE_URL looks like a Neon *direct* host (no -pooler). Prefer the pooled connection string.',
  );
}

const args = process.argv.slice(2);
if (args.length === 0) args.push('spring-boot:run');

// Only auto-manage local infra when actually running the app (not for verify/test,
// which use Testcontainers). Brings up Postgres + Redis and seeds via Flyway on boot.
if (args.includes('spring-boot:run')) {
  ensureDevInfra(jdbc);
}

const child = spawn(wrapper, args, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWin,
  // File last: local .env overrides stale shell/IDE exports.
  env: { ...process.env, ...dotEnv },
});
child.on('error', (err) => {
  console.error(`[run-backend] Failed to start Maven wrapper: ${err.message}`);
  console.error(
    '[run-backend] Is JDK 21 installed and on PATH? (winget install EclipseAdoptium.Temurin.21.JDK)',
  );
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
