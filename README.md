# Max

CLI wrappers that route Claude Code / Codex through multiple API-compatible endpoints:

- **max** - [MiniMax API](https://www.minimaxi.com) — routes Claude Code via Anthropic-compatible API
- **glm** - [Z.ai GLM](https://z.ai) — routes Claude Code via Anthropic-compatible API
- **klaude** - [Moonshot AI Kimi](https://www.moonshot.cn) — routes Claude Code via Anthropic-compatible API
- **kimix** - [Kimi for Coding](https://kimi.moonshot.cn) (`k3-256k`) — routes Codex CLI via a local proxy that translates Responses API ↔ Chat Completions

Use Claude Code or Codex with your preferred provider without modifying configuration each time.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and in your PATH (for `max`, `glm`, `klaude`)
- [Codex CLI](https://github.com/openai/codex) installed and in your PATH (for `kimix`)
- Python 3 with `flask` and `requests` (for `kimix` proxy — installed automatically)
- API key(s) for your chosen provider(s)

## Setup

### 1. Install the binaries

```bash
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/install.sh | bash
```

Or manually:

```bash
# Install all four
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max -o ~/bin/max
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/glm -o ~/bin/glm
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/klaude -o ~/bin/klaude
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/kimix -o ~/bin/kimix
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/kimix-proxy -o ~/bin/kimix-proxy
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/k3-catalog.json -o ~/bin/k3-catalog.json
chmod +x ~/bin/max ~/bin/glm ~/bin/klaude ~/bin/kimix ~/bin/kimix-proxy
```

`k3-catalog.json` must sit next to the `kimix` script — that's where it picks up the model list.

Ensure `~/bin` is in your `$PATH`.

### Additional setup for `kimix`

`kimix` starts a local HTTP proxy (`kimix-proxy`) that translates the Codex Responses API to Kimi's Chat Completions API. This lets the upstream Codex binary run unmodified.

One-time Python setup:
```bash
python3 -m venv ~/.kimix/venv
~/.kimix/venv/bin/pip install flask requests
```

Save your API key:
```bash
mkdir -p ~/.kimix && echo "your_kimi_coding_api_key" > ~/.kimix/token && chmod 600 ~/.kimix/token
```

That's it — `kimix` handles everything else on first run.

### 2. Provide your API key(s)

- **MiniMax**: `export MINIMAX_API_KEY=your_key_here`
- **Kimi (klaude)**: `export KIMI_CODING_API_KEY=your_key_here`
- **Kimi (kimix)**: `export KIMIX_API_KEY=your_key_here` or save to `~/.kimix/token`
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

`kimix` defaults to **`k3-256k`** — the same K3 model with a 256k context window. Plain `k3` is the full 1M-context variant and costs substantially more, so it's opt-in:

```bash
kimix -m k3 "trace this bug across the whole monorepo"
```

Or set it for a shell session:

```bash
export KIMIX_MODEL=k3
```

`kimi-for-coding` and `kimi-for-coding-highspeed` (K2.7, 256k) are also selectable the same way.

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

**kimix (Kimi K3 via Codex + proxy):**
```
KIMIX_API_KEY=<from $KIMIX_API_KEY or ~/.kimix/token>
KIMIX_MODEL=k3-256k               (default; `k3` = 1M context, much pricier)
CODEX_HOME=~/.kimix/codex-proxy   (isolated config: kimi provider, k3-256k model)
```

`kimix` starts `kimix-proxy` on `http://127.0.0.1:8787` — a local Flask server that translates Codex's OpenAI Responses API requests to Kimi Chat Completions requests, and streams responses back in Responses API SSE format. Codex's `config.toml` points to the proxy as a custom provider with `wire_api = "responses"`. The proxy is shared across sessions and stays running in the background.

Everything else — conversation history, tool use, etc. — is handled by the respective CLI as usual.

## License

MIT
