#!/usr/bin/env node
/**
 * Cross-platform launcher for the ML service via uv.
 *
 *   node scripts/run-ml.mjs dev     # uvicorn --reload on :8000
 *   node scripts/run-ml.mjs test    # pytest
 *   node scripts/run-ml.mjs lint    # ruff check
 *   node scripts/run-ml.mjs <args>  # uv run <args>
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv } from './load-root-env.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mlDir = join(root, 'ml');
const isWin = process.platform === 'win32';

// Root .env is the single source of truth; ml/.env (if present) overrides it.
const dotEnv = loadEnv(join(mlDir, '.env'));
const childEnv = { ...process.env, ...dotEnv };
const port = dotEnv.ML_PORT ?? process.env.ML_PORT ?? '8000';

const mode = process.argv[2] ?? 'dev';
const presets = {
  dev: ['run', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', port],
  serve: ['run', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port],
  test: ['run', 'pytest'],
  lint: ['run', 'ruff', 'check', '.'],
  typecheck: ['run', 'mypy', 'app'],
};
const args = presets[mode] ?? ['run', ...process.argv.slice(2)];
if (args[0] === 'run') {
  args.splice(1, 0, '--no-sync', '--python', '/usr/bin/python3');
}

const child = spawn('uv', args, { cwd: mlDir, stdio: 'inherit', shell: isWin, env: childEnv });
child.on('error', (err) => {
  console.error(`[run-ml] Failed to start uv: ${err.message}`);
  console.error('[run-ml] Is uv installed and on PATH? (winget install astral-sh.uv)');
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
