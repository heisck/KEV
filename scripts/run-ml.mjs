#!/usr/bin/env node
/**
 * Cross-platform launcher for the ML service via uv.
 *
 *   node scripts/run-ml.mjs dev     # uvicorn --reload on :8000
 *   node scripts/run-ml.mjs test    # pytest
 *   node scripts/run-ml.mjs lint    # ruff check
 *   node scripts/run-ml.mjs <args>  # uv run <args>
 */
import { spawn, spawnSync } from 'node:child_process';
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
// Opt-in interpreter pin (CI images with a preinstalled system Python). Unset by
// default so uv resolves/creates ml/.venv itself — a hardcoded POSIX path here
// makes every `uv run` fail on Windows.
const pinnedPython = dotEnv.ML_PYTHON ?? process.env.ML_PYTHON;
if (args[0] === 'run' && pinnedPython) {
  args.splice(1, 0, '--no-sync', '--python', pinnedPython);
}

// Fail with an actionable message instead of the shell's cryptic
// "'uv' is not recognized" / ENOENT.
if (spawnSync(isWin ? 'where' : 'which', ['uv'], { stdio: 'ignore' }).status !== 0) {
  console.error('[run-ml] uv is not installed or not on PATH — the ML service cannot start.');
  console.error(
    isWin
      ? '[run-ml] Install it with: winget install --id astral-sh.uv'
      : '[run-ml] Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh',
  );
  process.exit(1);
}

const child = spawn('uv', args, { cwd: mlDir, stdio: 'inherit', env: childEnv });
child.on('error', (err) => {
  console.error(`[run-ml] Failed to start uv: ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
