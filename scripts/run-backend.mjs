#!/usr/bin/env node
/**
 * Cross-platform launcher for the Maven wrapper in backend/.
 * Picks mvnw.cmd on Windows and ./mvnw elsewhere so the same npm
 * scripts work locally (Windows) and in CI (Linux).
 *
 *   node scripts/run-backend.mjs spring-boot:run
 *   node scripts/run-backend.mjs verify
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = join(root, 'backend');
const isWin = process.platform === 'win32';
const wrapper = isWin ? 'mvnw.cmd' : './mvnw';

const args = process.argv.slice(2);
if (args.length === 0) args.push('spring-boot:run');

const child = spawn(wrapper, args, { cwd: backendDir, stdio: 'inherit', shell: isWin });
child.on('error', (err) => {
  console.error(`[run-backend] Failed to start Maven wrapper: ${err.message}`);
  console.error(
    '[run-backend] Is JDK 21 installed and on PATH? (winget install EclipseAdoptium.Temurin.21.JDK)',
  );
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
