#!/usr/bin/env node
/**
 * Starts frontend, backend and ML each in its OWN terminal window/tab so the
 * Expo/Metro QR code stays readable and scannable (a merged `concurrently`
 * view interleaves output and mangles the QR block).
 *
 * Falls back to `concurrently` when no supported terminal emulator is found.
 *
 *   node scripts/dev-all.mjs
 *   node scripts/dev-all.mjs --same-terminal   # force the merged view
 */
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Frontend last: terminals focus the most recently opened tab/window, so Metro's
// QR code is the one on screen.
const SERVICES = [
  { title: 'KEV api', script: 'dev:backend' },
  { title: 'KEV ml', script: 'dev:ml' },
  { title: 'KEV web', script: 'dev:frontend' },
];

const has = (cmd) =>
  spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' })
    .status === 0;

const run = (cmd, args) => spawn(cmd, args, { cwd: root, stdio: 'inherit', detached: true }).unref();

function openWindows() {
  // Windows Terminal: one window, three tabs. `;` separates panes/tabs and must be escaped.
  if (has('wt')) {
    const args = SERVICES.flatMap(({ title, script }, i) => [
      ...(i === 0 ? [] : [';', 'new-tab']),
      '--title',
      title,
      '-d',
      root,
      'cmd',
      '/k',
      `npm run ${script}`,
    ]);
    run('wt', args);
    return true;
  }
  for (const { script } of SERVICES) {
    run('cmd', ['/c', 'start', '', 'cmd', '/k', `npm run ${script}`]);
  }
  return true;
}

function openMac() {
  for (const { script } of SERVICES) {
    const cmd = `cd ${JSON.stringify(root)} && npm run ${script}`;
    run('osascript', [
      '-e',
      `tell application "Terminal" to do script ${JSON.stringify(cmd)}`,
      '-e',
      'tell application "Terminal" to activate',
    ]);
  }
  return true;
}

function openLinux() {
  const emulator = ['gnome-terminal', 'konsole', 'xfce4-terminal', 'x-terminal-emulator'].find(has);
  if (!emulator) return false;
  for (const { script } of SERVICES) {
    const shell = `cd ${JSON.stringify(root)}; npm run ${script}; exec $SHELL`;
    run(emulator, emulator === 'konsole' ? ['-e', 'bash', '-lc', shell] : ['--', 'bash', '-lc', shell]);
  }
  return true;
}

function fallback() {
  const child = spawn(
    'npx',
    [
      'concurrently',
      '-k',
      '-n',
      'api,ml,web',
      '-c',
      'green,magenta,cyan',
      ...SERVICES.map(({ script }) => `npm:${script}`),
    ],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
  );
  child.on('exit', (code) => process.exit(code ?? 0));
}

if (process.argv.includes('--same-terminal')) {
  fallback();
} else {
  const opened =
    process.platform === 'win32' ? openWindows()
    : process.platform === 'darwin' ? openMac()
    : openLinux();

  if (opened) {
    console.log('[dev] launched web / api / ml in separate terminals — Metro QR is in the "web" window');
  } else {
    console.warn('[dev] no supported terminal emulator found; falling back to a single merged view');
    fallback();
  }
}
