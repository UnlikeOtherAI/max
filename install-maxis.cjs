#!/usr/bin/env node
'use strict';
// Install a self-contained copy; the source worktree can then be removed.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const source = path.join(__dirname, 'maxis');
const destination = path.resolve(process.env.MAX_INSTALL_DIR || path.join(os.homedir(), '.local', 'bin'));
fs.mkdirSync(destination, { recursive: true });
function install(file, bytes, executable = false) {
  const target = path.join(destination, file);
  const temporary = path.join(destination, '.maxis-install-' + randomUUID());
  try {
    fs.writeFileSync(temporary, bytes);
    if (executable) fs.chmodSync(temporary, 0o755);
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
if (process.platform === 'win32') {
  install('maxis.cjs', fs.readFileSync(source));
  install('maxis.cmd',
    '@echo off\r\n"' + process.execPath + '" "%~dp0maxis.cjs" %*\r\n');
} else {
  install('maxis', fs.readFileSync(source), true);
}
console.log('Installed maxis ' + destination);
console.log('Requires Node.js 18.17+ and Codex CLI 0.166.0+. Strata is discovered when you run maxis.');
