'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { endpoint, limits, selection, validateArgs, guardedProxy, catalog } = require('../maxis');

async function fixture(t) {
  const state = {
    health: { service: 'strata', loaded: true, model: 'qwen-active', max_context: 262144, images: false },
    requests: [],
  };
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(state.health));
    }
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      state.requests.push({ path: req.url, headers: req.headers, body });
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      res.write('event: response.created\ndata: {"id":"local"}\n\n');
      res.end('event: response.output_text.delta\ndata: {"delta":"café"}\n\n');
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  return { state, base: 'http://127.0.0.1:' + server.address().port };
}

function run(file, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { env: { ...process.env, ...env }, windowsHide: true });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}

test('context budgets follow every tested Strata window and leave output headroom', () => {
  for (const context of [32768, 262144, 524288, 1048576]) {
    const active = { model: 'loaded', images: false, ...limits(context) };
    const model = catalog(active).models[0];
    assert.equal(model.context_window, context);
    assert.equal(model.max_context_window, context);
    assert.equal(model.auto_compact_token_limit, active.compact);
    assert.ok(context - active.compact >= Math.max(8192, Math.ceil(context * 0.20)));
  }
  for (const invalid of [undefined, '1048576', 0, -1, 10.5, Infinity]) assert.throws(() => limits(invalid));
});

test('a stopped or unrelated backend is not treated as an active Strata model', async t => {
  const { state, base } = await fixture(t);
  state.health.loaded = false;
  await assert.rejects(selection(base), /No Strata model/);
  state.health.loaded = true;
  state.health.service = 'ollama';
  await assert.rejects(selection(base), /No Strata model/);
});

test('caller overrides cannot redirect the model, provider or context', () => {
  for (const args of [
    ['-m', 'cloud'], ['--model=cloud'], ['-p', 'cloud'], ['--oss'],
    ['--local-provider', 'ollama'], ['-c', 'model_context_window=1048576'],
    ['--config=model_provider="openai"'], ['-cmodel="cloud"'],
    ['-c', '"model_providers"."maxis"."base_url"="https://example.test"'],
    ['-c', 'model_catalog_json="stale.json"'], ['-c', 'profiles.other.model="cloud"'],
  ]) assert.throws(() => validateArgs(args));
  assert.doesNotThrow(() => validateArgs(['exec', '-c', 'model_reasoning_effort="high"', '--json', '--', '-m this is prompt text']));
  assert.equal(endpoint('http://localhost:8084/v1/'), 'http://localhost:8084');
  assert.throws(() => endpoint('https://name:secret@example.test'));
});

test('SSE is forwarded unchanged and client credentials are not forwarded', async t => {
  const { state, base } = await fixture(t);
  const initial = await selection(base);
  const proxy = await guardedProxy(base, initial);
  t.after(() => proxy.close());
  const response = await fetch(proxy.url + '/responses', {
    method: 'POST', headers: { Authorization: 'Bearer synthetic-cloud-token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: initial.model, input: 'hello', stream: true }),
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(),
    'event: response.created\ndata: {"id":"local"}\n\nevent: response.output_text.delta\ndata: {"delta":"café"}\n\n');
  assert.equal(state.requests.length, 1);
  assert.equal(state.requests[0].headers.authorization, undefined);
  assert.equal(state.requests[0].path, '/v1/responses');
  assert.equal(Number(state.requests[0].headers['content-length']), Buffer.byteLength(state.requests[0].body));
});

test('only the explicitly configured Strata key reaches its endpoint', async t => {
  const { state, base } = await fixture(t);
  const proxy = await guardedProxy(base, await selection(base), 'synthetic-local-token');
  t.after(() => proxy.close());
  const response = await fetch(proxy.url + '/responses', { method: 'POST', body: '{}' });
  await response.text();
  assert.equal(state.requests[0].headers.authorization, 'Bearer synthetic-local-token');
});

for (const changed of ['model', 'max_context', 'images']) {
  test('a mid-session ' + changed + ' change is rejected before forwarding inference', async t => {
    const { state, base } = await fixture(t);
    const proxy = await guardedProxy(base, await selection(base));
    t.after(() => proxy.close());
    state.health[changed] = changed === 'model' ? 'deepseek-new' : changed === 'images' ? true : 1048576;
    const response = await fetch(proxy.url + '/responses', { method: 'POST', body: '{}' });
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error.code, 'maxis_selection_changed');
    assert.equal(state.requests.length, 0);
    assert.equal(proxy.changed(), true);
  });
}

test('browser-origin and non-inference requests never reach Strata', async t => {
  const { state, base } = await fixture(t);
  const proxy = await guardedProxy(base, await selection(base));
  t.after(() => proxy.close());
  const response = await fetch(proxy.url + '/responses', { method: 'POST', headers: { Origin: 'https://example.test' }, body: '{}' });
  assert.equal(response.status, 403);
  await response.text();
  const other = await fetch(proxy.url + '/admin');
  assert.equal(other.status, 404);
  await other.text();
  assert.equal(state.requests.length, 0);
});

test('launch keeps arguments literal, derives the catalog, and isolates credentials', async t => {
  const { base } = await fixture(t);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'maxis test '));
  t.after(() => fs.rmSync(scratch, { recursive: true }));
  const stub = path.join(scratch, 'codex.cjs');
  const capture = path.join(scratch, 'capture.json');
  const normalHome = path.join(scratch, 'normal-codex');
  fs.mkdirSync(normalHome);
  fs.writeFileSync(path.join(normalHome, 'AGENTS.md'), 'Use the user global instructions.\n');
  fs.writeFileSync(stub, [
    "const fs=require('node:fs');",
    "if(process.argv.includes('--version')){console.log('codex-cli 0.166.0');process.exit(0)}",
    "const args=process.argv.slice(2);",
    "const config=Object.fromEntries(args.flatMap((a,i)=>a==='-c'?[args[i+1].split(/=(.*)/s).slice(0,2)]:[]));",
    "const model=JSON.parse(fs.readFileSync(JSON.parse(config.model_catalog_json),'utf8')).models[0];",
    "fs.writeFileSync(process.env.CAPTURE,JSON.stringify({args,config,model,home:process.env.CODEX_HOME,key:process.env.MAXIS_STRATA_API_KEY,openai:process.env.OPENAI_API_KEY,agents:fs.readFileSync(require('node:path').join(process.env.CODEX_HOME,'AGENTS.md'),'utf8')}));",
  ].join('\n'));
  const prompt = 'keep spaces, $(), backticks and "quotes" literal';
  const result = await run(path.join(__dirname, '..', 'maxis'), ['exec', '--', prompt], {
    MAXIS_STRATA_URL: base, MAXIS_CODEX_BIN: stub, MAXIS_HOME: path.join(scratch, 'maxis'),
    CODEX_HOME: normalHome, MAXIS_STRATA_API_KEY: 'synthetic-local-token',
    OPENAI_API_KEY: 'synthetic-cloud-token', CAPTURE: capture,
  });
  assert.equal(result.code, 0, result.stderr);
  const got = JSON.parse(fs.readFileSync(capture, 'utf8'));
  assert.equal(got.args.at(-1), prompt);
  assert.equal(got.args[0], '--model');
  assert.equal(got.args[1], 'qwen-active');
  assert.equal(got.model.context_window, 262144);
  assert.equal(got.model.auto_compact_token_limit, 209715);
  assert.equal(got.key, undefined);
  assert.equal(got.openai, undefined);
  assert.notEqual(got.home, normalHome);
  assert.equal(got.agents, 'Use the user global instructions.\n');
  assert.deepEqual(fs.readdirSync(path.join(scratch, 'maxis', 'runtime')), []);
});

test('installer creates a standalone command in a path with spaces', async t => {
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), 'maxis install '));
  t.after(() => fs.rmSync(destination, { recursive: true }));
  const result = await run(path.join(__dirname, '..', 'install-maxis.cjs'), [], { MAX_INSTALL_DIR: destination });
  assert.equal(result.code, 0, result.stderr);
  const target = path.join(destination, process.platform === 'win32' ? 'maxis.cjs' : 'maxis');
  const help = await run(target, ['--help'], {});
  assert.equal(help.code, 0, help.stderr);
  assert.match(help.stdout, /active Strata selection/);
  if (process.platform === 'win32') {
    assert.match(fs.readFileSync(path.join(destination, 'maxis.cmd'), 'utf8'), /%~dp0maxis.cjs/);
  }
});

test('an auxiliary model request cannot bypass the selected model', async t => {
  const { state, base } = await fixture(t);
  const proxy = await guardedProxy(base, await selection(base));
  t.after(() => proxy.close());
  const response = await fetch(proxy.url + '/responses', { method: 'POST',
    body: JSON.stringify({ model: 'cloud-helper', input: 'hello' }) });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'maxis_model_override');
  assert.equal(state.requests.length, 0);
});
