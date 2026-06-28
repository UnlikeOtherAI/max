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
# MiniMax
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max -o ~/bin/max
chmod +x ~/bin/max

# GLM
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/glm -o ~/bin/glm
chmod +x ~/bin/glm

# Kimi (klaude)
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/klaude -o ~/bin/klaude
chmod +x ~/bin/klaude
```

Ensure `~/bin` is in your `$PATH`.

### 2. Provide your API key(s)

**Choose your provider:**

- **MiniMax**: `export MINIMAX_API_KEY=your_key_here`
- **Kimi**: `export KIMI_API_KEY=your_key_here`
- **GLM**: `export GLM_API_KEY=your_key_here`

**Or use on first run** (interactive):

```bash
max "your prompt"    # MiniMax
glm "your prompt"    # GLM
klaude "your prompt" # Kimi
```

Each tool will prompt you to enter its API key if not set. Keys are saved to `~/.max/token`.

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
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/paas/v4/anthropic
ANTHROPIC_AUTH_TOKEN=<your GLM_API_KEY>
```

**klaude (Kimi/Moonshot AI):**
```
ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
ANTHROPIC_AUTH_TOKEN=<your KIMI_API_KEY>
```

Everything else — model selection, conversation history, tool use — is handled by Claude Code as usual.

## License

MIT
