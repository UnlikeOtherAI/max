# Max

CLI wrappers that route Claude Code / Codex through multiple API-compatible endpoints:

- **max** - [MiniMax API](https://www.minimaxi.com) — routes Claude Code via Anthropic-compatible API
- **glm** - [Z.ai GLM](https://z.ai) — routes Claude Code via Anthropic-compatible API
- **klaude** - [Moonshot AI Kimi](https://www.moonshot.cn) — routes Claude Code via Anthropic-compatible API
- **maxis** - the currently loaded Strata model — runs Codex with the actual model/context
- **kimix** - [Kimi K3](https://platform.kimi.ai/docs/guide/codex-kimi) (`kimi-k3`) — connects Codex CLI directly to Kimi's native Responses API

Use Claude Code or Codex with your preferred provider without modifying configuration each time.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and in your PATH (for `max`, `glm`, `klaude`)
- [Codex CLI](https://github.com/openai/codex) installed and in your PATH (for `kimix`)
- API key(s) for your chosen provider(s)

## Setup

### 1. Install the binaries

```bash
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/install.sh | bash
```

Or manually:

```bash
# Install all five
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max -o ~/bin/max
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/glm -o ~/bin/glm
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/klaude -o ~/bin/klaude
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/kimix -o ~/bin/kimix
chmod +x ~/bin/max ~/bin/glm ~/bin/klaude ~/bin/kimix
```

Ensure `~/bin` is in your `$PATH`.

### Additional setup for `kimix`

Kimi natively supports the Responses API used by Codex, so `kimix` connects
Codex directly to Kimi — no local proxy or Python setup is required.

Save your API key:
```bash
mkdir -p ~/.kimix && echo "your_kimi_api_key" > ~/.kimix/token && chmod 600 ~/.kimix/token
```

That's it — `kimix` handles everything else on first run.

### 2. Provide your API key(s)

- **MiniMax**: `export MINIMAX_API_KEY=your_key_here`
- **Kimi (klaude)**: `export KIMI_CODING_API_KEY=your_key_here`
- **Kimi (kimix)**: `export KIMI_API_KEY=your_key_here` or save to `~/.kimix/token`. `KIMIX_API_KEY` is accepted for backward compatibility.
- **GLM**: `export ZAI_CODING_PLAN_API_KEY=your_key_here`

**Or use on first run** (interactive):

```bash
max "your prompt"    # MiniMax — prompts for key if not set, saves to ~/.max/token
```

**Note:** `glm` and `klaude` require their respective environment variables to be set in your shell.

## Usage

Each CLI tool passes all arguments directly to Claude Code or Codex:

```bash
max "refactor the auth module"
max --print "what changed in the last commit"
max --input "file.txt" "explain this"

glm "refactor the auth module"
glm --print "what changed in the last commit"
glm --input "file.txt" "explain this"

klaude "refactor the auth module"
klaude --print "what changed in the last commit"
klaude --input "file.txt" "explain this"

kimix "refactor the auth module"
kimix "what changed in the last commit"
```

### Choosing a Kimi model

`kimix` defaults to **`kimi-k3`**, Kimi's documented 1M-context Codex model. To use another Kimi model deliberately, supply it with `--model` (or `KIMIX_MODEL`) and set its known context window too:

```bash
KIMIX_MODEL_CONTEXT_WINDOW=262144 kimix -m another-kimi-model "review this module"
```

Or set a model for a shell session:

```bash
export KIMIX_MODEL=kimi-k3
```

## How it works

Each CLI tool sets environment variables before spawning Claude Code:

**max (MiniMax):**
```
ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
ANTHROPIC_AUTH_TOKEN=<your MINIMAX_API_KEY>
```

**glm (Z.ai):**
```
ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
ANTHROPIC_AUTH_TOKEN=<your ZAI_CODING_PLAN_API_KEY>
ANTHROPIC_MODEL=glm-4.6
ANTHROPIC_SMALL_FAST_MODEL=glm-4.5-air
```

**klaude (Kimi/Moonshot AI):**
```
ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
ANTHROPIC_AUTH_TOKEN=<your KIMI_CODING_API_KEY>
ANTHROPIC_MODEL=kimi-for-coding
```

**kimix (Kimi K3 via Codex):**
```
KIMI_API_KEY=<from $KIMI_API_KEY or ~/.kimix/token>
KIMIX_MODEL=kimi-k3               (default; 1M context)
CODEX_HOME=~/.kimix/codex         (isolated config: direct Kimi provider)
```

`kimix` writes a derived Codex config that uses Kimi's native Responses endpoint:
`https://api.moonshot.ai/v1`. This preserves the full Codex protocol — including
tool continuation and context compaction — without a local protocol translator.

Everything else — conversation history, tool use, etc. — is handled by the respective CLI as usual.

## License

MIT

## Active Strata model with maxis

`maxis` launches Codex against the model currently loaded by the Local Models
launcher on Maxis. It reads Strata's health API on each launch: the loaded Qwen
or DeepSeek model and its **configured** context window determine the Codex
catalog, context budget and automatic compaction threshold. It never starts a
model or falls back to a cloud provider. The Ollama/Gemma choice is a separate
backend; select and start a Strata model first.

Requires Node.js 18.17+ and Codex CLI **0.166.0 or newer**. The Codex submodule
is pinned to the official `rust-v0.166.0` release; a source build is not required.

Install a standalone copy on Windows, macOS or Linux:

```sh
node install-maxis.cjs
maxis --status
maxis "inspect this repository and explain its entry points"
maxis exec "fix the failing test"
maxis resume --last
```

The installer uses `~/.local/bin` by default, or `MAX_INSTALL_DIR`. Windows
gets a native `maxis.cmd` shim and a JavaScript payload; it does not need Bash.
The installed copy does not depend on a source worktree. Ensure the installation
directory is on PATH.

The default endpoint is `http://Maxis.local:8084`. To use another Strata server:

```sh
MAXIS_STRATA_URL=http://your-host:8084 maxis --status
```

In PowerShell, set `$env:MAXIS_STRATA_URL` before running `maxis`. A URL ending
in `/v1` is accepted too. An optional `MAXIS_STRATA_API_KEY` authenticates to
Strata; it is kept out of Codex's child environment and derived configuration.

`maxis --status` reports the actual model, window, compaction threshold and
Codex version. A 262,144-position window compacts at 209,715 tokens; a 32,768
window compacts at 24,576. Larger windows reserve 20% for estimation differences,
instructions, tool results and output. Codex's usable-window margin is also
retained. The stream idle timeout is one hour for slow long-context prefills;
this does not make those prefills faster.

A session checks the model, context and image capability before each request.
If the desktop selection changes, the request fails with a restart instruction.
Restart `maxis` (or resume it) to adopt the new selection and budget. It does
not silently reuse a 1M budget after a switch to 256K. Model, provider, profile
and context overrides are refused; ordinary Codex arguments pass through.

Sessions and configuration are isolated in `~/.maxis/codex` (override with
`MAXIS_CODEX_HOME` or relocate the whole wrapper state with `MAXIS_HOME`).
The first run creates the same full-access defaults used by `kimix`;
subsequent runs preserve that configuration. Reasoning defaults to `none`,
and normal Codex reasoning/sandbox flags remain available. The normal Codex
global `AGENTS.md` is copied on launch so its instructions still apply;
OpenAI/Kimi credentials are not copied. `MAXIS_CODEX_BIN` can select a Codex
executable explicitly. Installed Windows npm and simple native-binary shims
are resolved directly so arguments never pass through a shell.

Run the regression checks with `npm run test:maxis`.
