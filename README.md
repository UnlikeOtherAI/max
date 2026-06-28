# Max

A CLI wrapper that routes Claude Code through multiple API-compatible endpoints:

- **MiniMax** - [MiniMax API](https://www.minimaxi.com)
- **Kimi** - [Moonshot AI](https://www.moonshot.cn)
- **GLM** - [Z.ai](https://z.ai)

Use Claude Code with your preferred API provider without modifying configuration each time.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and in your PATH
- API key(s) for your chosen provider(s):

## Setup

### 1. Install the binary

```bash
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/install.sh | bash
```

Or manually:

```bash
curl -fsSL https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max -o ~/bin/max
chmod +x ~/bin/max
```

Ensure `~/bin` is in your `$PATH`.

### 2. Provide your API key(s)

**Choose your provider:**

- **MiniMax**: `export MINIMAX_API_KEY=your_key_here`
- **Kimi**: `export KIMI_API_KEY=your_key_here`
- **GLM**: `export GLM_API_KEY=your_key_here`

**Or use on first run** (interactive):

```bash
max "your prompt"
```

Max will prompt you to enter your API key based on the provider you choose. The key is saved to `~/.max/token`.

## Usage

Max passes all arguments directly to Claude Code:

```bash
max "refactor the auth module"
max --print "what changed in the last commit"
max --input "file.txt" "explain this"
```

**Choosing a provider:**

```bash
# Uses provider based on which API key is set
max "your prompt"

# Or specify provider directly (overrides env vars)
max --provider minimax "your prompt"
max --provider kimi "your prompt"
max --provider glm "your prompt"
```

## How it works

Max sets environment variables before spawning Claude Code based on the chosen provider:

**MiniMax:**
```
ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
ANTHROPIC_AUTH_TOKEN=<your MINIMAX_API_KEY>
```

**Kimi:**
```
ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
ANTHROPIC_AUTH_TOKEN=<your KIMI_API_KEY>
```

**GLM:**
```
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/paas/v4/anthropic
ANTHROPIC_AUTH_TOKEN=<your GLM_API_KEY>
```

Everything else — model selection, conversation history, tool use — is handled by Claude Code as usual.

## License

MIT
