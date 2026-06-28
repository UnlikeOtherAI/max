#!/usr/bin/env bash
set -e

INSTALL_DIR="${MAX_INSTALL_DIR:-$HOME/bin}"

echo "Installing Max CLI wrappers to $INSTALL_DIR ..."

# Install max (MiniMax)
echo "Installing max (MiniMax)..."
curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max" -o "$INSTALL_DIR/max"
chmod +x "$INSTALL_DIR/max"

# Install glm (Z.ai)
echo "Installing glm (Z.ai)..."
curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/glm" -o "$INSTALL_DIR/glm"
chmod +x "$INSTALL_DIR/glm"

# Install klaude (Kimi)
echo "Installing klaude (Kimi)..."
curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/klaude" -o "$INSTALL_DIR/klaude"
chmod +x "$INSTALL_DIR/klaude"

echo "Done. Run 'max --help', 'glm --help', or 'klaude --help' to get started."
echo ""
echo "Set your API keys:"
echo "  export MINIMAX_API_KEY=your_key    # for max"
echo "  export ZAI_CODING_PLAN_API_KEY=your_key  # for glm"
echo "  export KIMI_CODING_API_KEY=your_key     # for klaude"
