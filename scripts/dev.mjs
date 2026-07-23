#!/usr/bin/env node
/**
 * Smart launcher for KEV monorepo development.
 *
 * Spawns backend (Spring Boot) and ML (FastAPI) in a separate terminal window on Windows
 * (or background process) so Spring Boot logs never scroll past or wipe out the Expo Metro QR code.
 *
 * The current main IDE terminal is 100% dedicated to Expo Metro CLI:
 *   - Clean, persistent QR code and local IP (exp://192.168.x.x:8081)
 *   - Interactive Metro keyboard shortcuts ('c' to clear cache, 'a' for Android, 'i' for iOS, 'r' to reload)
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

console.log('[dev-launcher] Starting KEV monorepo dev environment...');

if (isWin) {
  console.log('[dev-launcher] Spawning Backend (Spring Boot) & ML (FastAPI) in a dedicated terminal window...');
  // Launch backend and ML in a separate Command Prompt window on Windows
  const servicesCmd = 'npx concurrently -k -n api,ml -c green,magenta "npm:backend" "npm:ml"';
  spawn('cmd.exe', ['/c', 'start', 'cmd', '/k', servicesCmd], {
    cwd: root,
    stdio: 'ignore',
    shell: true,
  });
} else {
  console.log('[dev-launcher] Spawning Backend & ML services in background...');
  spawn('npx', ['concurrently', '-k', '-n', 'api,ml', '-c', 'green,magenta', 'npm:backend', 'npm:ml'], {
    cwd: root,
    stdio: 'inherit',
  });
}

console.log('[dev-launcher] Launching Expo Frontend in main IDE terminal...\n');

// Keep main IDE terminal dedicated to Expo with full TTY interaction & QR code visibility
const expo = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'frontend'], {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
});

expo.on('exit', (code) => process.exit(code ?? 0));
