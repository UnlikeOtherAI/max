# Max

CLI wrappers that route Claude Code through multiple API-compatible endpoints:

- **max** - [MiniMax API](https://www.minimaxi.com)
- **glm** - [Z.ai GLM](https://z.ai)
- **klaude** - [Moonshot AI Kimi](https://www.moonshot.cn)

Use Claude Code with your preferred API provider without modifying configuration each time.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and in your PATH
- API key(s) for your chosen provider(s):

## Setup

### 1. Install the binaries

```bash
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/install.sh | bash
```

Or manually:

```bash
# Install all three
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max -o ~/bin/max
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/glm -o ~/bin/glm
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/klaude -o ~/bin/klaude
chmod +x ~/bin/max ~/bin/glm ~/bin/klaude
```

Ensure `~/bin` is in your `$PATH`.

### 2. Provide your API key(s)

**Choose your provider:**

- **MiniMax**: `export MINIMAX_API_KEY=your_key_here`
- **Kimi**: `export KIMI_CODING_API_KEY=your_key_here`
- **GLM**: `export ZAI_CODING_PLAN_API_KEY=your_key_here`

**Or use on first run** (interactive):

```bash
max "your prompt"    # MiniMax
```

If no `MINIMAX_API_KEY` is set, `max` will prompt you to enter it. The key is saved to `~/.max/token`.

**Note:** `glm` and `klaude` require their respective environment variables to be set in your shell (they don't have interactive setup yet).

## Usage

Each CLI tool passes all arguments directly to Claude Code:

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

Everything else — conversation history, tool use, etc. — is handled by Claude Code as usual.

## License

MIT
