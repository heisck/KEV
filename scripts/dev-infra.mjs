#!/usr/bin/env node
/**
 * Ensures local dev infra (Postgres + Redis) is up before the backend starts,
 * so `npm run dev` seeds and serves in one command. Flyway then runs the seed
 * migrations automatically on Spring Boot startup.
 *
 * No-ops (returns without throwing) when:
 *   - the datasource is remote (Neon / non-localhost) — infra is managed elsewhere
 *   - Docker isn't installed or the daemon isn't running — we don't block startup;
 *     Spring Boot will surface a clear connection error itself
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

/** True only for a localhost/127.0.0.1 JDBC URL (i.e. we own the DB lifecycle). */
function isLocalDatasource(jdbc) {
  return /(?:\/\/|@)(?:localhost|127\.0\.0\.1)[:/]/.test(jdbc);
}

/** Resolve the docker CLI executable path across standard system and Docker Desktop paths. */
function getDockerCmd() {
  if (!isWin) return 'docker';
  const localAppData = process.env.LOCALAPPDATA || join(process.env.USERPROFILE || '', 'AppData', 'Local');
  const userDockerBin = join(localAppData, 'Programs', 'DockerDesktop', 'resources', 'bin', 'docker.exe');
  if (existsSync(userDockerBin)) return userDockerBin;
  const progDockerBin = join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Docker', 'Docker', 'resources', 'bin', 'docker.exe');
  if (existsSync(progDockerBin)) return progDockerBin;
  return 'docker';
}

function docker(args, opts = {}) {
  const cmd = getDockerCmd();
  return spawnSync(cmd, args, { cwd: repoRoot, shell: isWin, ...opts });
}

/** @returns {boolean} whether the Docker daemon is reachable. */
function dockerRunning() {
  const res = docker(['info'], { stdio: 'ignore' });
  return res.status === 0;
}

/** Block until Postgres reports healthy (or give up after ~timeoutMs). */
function waitForPostgres(timeoutMs = 60_000) {
  const started = Date.now();
  process.stdout.write('[dev-infra] waiting for Postgres to be ready');
  while (Date.now() - started < timeoutMs) {
    const res = docker(['compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'kev'], {
      stdio: 'ignore',
    });
    if (res.status === 0) {
      process.stdout.write(' ✓\n');
      return true;
    }
    process.stdout.write('.');
    spawnSync(isWin ? 'timeout' : 'sleep', isWin ? ['/t', '2'] : ['2'], { stdio: 'ignore', shell: isWin });
  }
  process.stdout.write(' timeout\n');
  return false;
}

/**
 * Bring up postgres + redis if the backend targets a local DB and Docker is up.
 * @param {string} jdbc resolved SPRING_DATASOURCE_URL
 */
export function ensureDevInfra(jdbc) {
  if (!isLocalDatasource(jdbc)) return; // Neon/remote — nothing to manage locally.

  if (!dockerRunning()) {
    console.warn(
      '[dev-infra] Local DB configured but Docker is not running — skipping container startup.\n' +
        '[dev-infra] Start Docker Desktop (or run `docker compose up -d postgres redis`) if the backend fails to connect.',
    );
    return;
  }

  console.log('[dev-infra] starting Postgres + Redis (docker compose up -d)…');
  const up = docker(['compose', 'up', '-d', 'postgres', 'redis'], { stdio: 'inherit' });
  if (up.status !== 0) {
    console.warn('[dev-infra] `docker compose up` failed — continuing; Spring Boot will report DB errors if unreachable.');
    return;
  }
  waitForPostgres();
}
