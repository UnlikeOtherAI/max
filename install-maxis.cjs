#!/usr/bin/env node
'use strict';
// Install a self-contained copy; the source worktree can then be removed.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const source = path.join(__dirname, 'maxis');
const destination = path.resolve(process.env.MAX_INSTALL_DIR || path.join(os.homedir(), '.local', 'bin'));
fs.mkdirSync(destination, { recursive: true });
if (process.platform === 'win32') {
  fs.copyFileSync(source, path.join(destination, 'maxis.cjs'));
  fs.writeFileSync(path.join(destination, 'maxis.cmd'),
    '@echo off\r\n"' + process.execPath + '" "%~dp0maxis.cjs" %*\r\n');
} else {
  const target = path.join(destination, 'maxis');
  fs.copyFileSync(source, target);
  fs.chmodSync(target, 0o755);
}
console.log('Installed maxis ' + destination);
console.log('Requires Node.js 18.17+ and Codex CLI 0.166.0+. Strata is discovered when you run maxis.');
