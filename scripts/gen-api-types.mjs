#!/usr/bin/env node
/**
 * Generate packages/api-types from the backend's OpenAPI schema so the
 * frontend axios client + React Query hooks are typed end-to-end.
 *
 * Source resolution:
 *   - default: live backend at ${API_URL:-http://localhost:8080}/v3/api-docs
 *   - USE_OPENAPI_FILE=1: read backend/openapi.json (checked-in snapshot, used in CI)
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'packages', 'api-types', 'src', 'schema.d.ts');
const fallbackFile = join(root, 'backend', 'openapi.json');
const liveUrl = `${process.env.API_URL ?? 'http://localhost:8080'}/v3/api-docs`;

const useFile = process.env.USE_OPENAPI_FILE === '1' && existsSync(fallbackFile);
const source = useFile ? fallbackFile : liveUrl;
const isWin = process.platform === 'win32';

console.log(`[gen-api-types] source: ${source}`);
const child = spawn('npx', ['--yes', 'openapi-typescript', source, '-o', out], {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
});
child.on('error', (err) => {
  console.error(`[gen-api-types] ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
