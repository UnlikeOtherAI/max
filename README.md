# Max

CLI wrappers that route Claude Code / Codex through multiple API-compatible endpoints:

- **max** - [MiniMax API](https://www.minimaxi.com) — routes Claude Code via Anthropic-compatible API
- **glm** - [Z.ai GLM](https://z.ai) — routes Claude Code via Anthropic-compatible API
- **klaude** - [Moonshot AI Kimi](https://www.moonshot.cn) — routes Claude Code via Anthropic-compatible API
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
# Install all four
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
