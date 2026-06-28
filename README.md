# Max

A CLI wrapper that routes Claude Code through the [MiniMax](https://www.minimaxi.com) API — so you can use Claude Code with any API-compatible endpoint.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and in your PATH
- A MiniMax API key

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

### 2. Provide your API key

**First run** (interactive):

```bash
max "your prompt"
```

If no `MINIMAX_API_KEY` is set, Max will prompt you to enter it. The key is saved to `~/.max/token`.

**Or** set it in your shell:

```bash
export MINIMAX_API_KEY=your_key_here
```

## Usage

Max passes all arguments directly to Claude Code:

```bash
max "refactor the auth module"
max --print "what changed in the last commit"
max --input "file.txt" "explain this"
```

## How it works

Max sets two environment variables before spawning Claude Code:

```
ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
ANTHROPIC_AUTH_TOKEN=<your API key>
```

Everything else — model selection, conversation history, tool use — is handled by Claude Code as usual.

## License

MIT
