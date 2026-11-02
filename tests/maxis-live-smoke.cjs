#!/usr/bin/env node
'use strict';
// Optional integration eval: uses the installed maxis and the active Strata model.
// All model writes are confined to a newly created scratch directory.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomInt } = require('node:crypto');
const { spawn } = require('node:child_process');

function execute(file, args, env, timeout = 180000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    const timer = setTimeout(() => { child.kill(); reject(new Error('Live maxis eval exceeded three minutes.')); }, timeout);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

async function main() {
  const installed = process.env.MAXIS_INSTALLED_SCRIPT || path.join(os.homedir(), '.local', 'bin',
    process.platform === 'win32' ? 'maxis.cjs' : 'maxis');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'maxis-live-'));
  const profiles = path.resolve(process.env.MAXIS_LIVE_PROFILE_ROOT || path.join(os.homedir(), '.maxis', 'live-evals'));
  fs.mkdirSync(profiles, { recursive: true });
  const profile = fs.mkdtempSync(path.join(profiles, 'run-'));
  const env = { ...process.env, MAXIS_HOME: profile, MAXIS_CODEX_HOME: path.join(profile, 'codex') };
  const started = Date.now();
  try {
    const status = await execute(installed, ['--status'], env);
    if (status.code !== 0) throw new Error(status.stderr);
    const active = JSON.parse(status.stdout);
    const a = randomInt(1000, 9000), b = randomInt(1000, 9000);
    fs.writeFileSync(path.join(directory, 'numbers.json'), JSON.stringify({ a, b }));
    const result = await execute(installed, ['exec', '--skip-git-repo-check', '-C', directory, '--json',
      '--output-last-message', path.join(directory, 'last.txt'),
      'Read numbers.json with a tool, add a and b, and write only their decimal sum plus a newline to answer.txt using a tool. Then reply exactly done. Work only in this scratch directory; do not use network services or other repositories.'], env);
    fs.writeFileSync(path.join(directory, 'events.jsonl'), result.stdout);
    fs.writeFileSync(path.join(directory, 'stderr.log'), result.stderr);
    if (result.code !== 0) throw new Error('Codex exited ' + result.code + '. Evidence: ' + directory);
    const events = result.stdout.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
    const commands = events.filter(event => event.type === 'item.completed' && event.item?.type === 'command_execution');
    const answer = fs.readFileSync(path.join(directory, 'answer.txt'), 'utf8').trim();
    const last = fs.readFileSync(path.join(directory, 'last.txt'), 'utf8').trim();
    if (!commands.length || answer !== String(a + b) || last !== 'done' || !events.some(event => event.type === 'turn.completed')) {
      throw new Error('Tool/read/write verification failed. Evidence: ' + directory);
    }
    console.log(JSON.stringify({ passed: true, host: os.hostname(), ...active,
      tool_commands: commands.length, expected: a + b, actual: Number(answer),
      elapsed_seconds: (Date.now() - started) / 1000, evidence: directory }, null, 2));
  } finally {
    // These are exact directories this invocation created; retain the scratch evidence.
    if (!profile.startsWith(profiles + path.sep)) throw new Error('Invalid owned eval profile.');
    fs.rmSync(profile, { recursive: true, maxRetries: 3, retryDelay: 100 });
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
