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

# Install klaude (Kimi via Claude Code)
echo "Installing klaude (Kimi/Claude Code)..."
curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/klaude" -o "$INSTALL_DIR/klaude"
chmod +x "$INSTALL_DIR/klaude"

# Install kimix (Kimi K2 via Codex + proxy)
echo "Installing kimix (Kimi K2/Codex)..."
curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/kimix" -o "$INSTALL_DIR/kimix"
chmod +x "$INSTALL_DIR/kimix"
curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/kimix-proxy" -o "$INSTALL_DIR/kimix-proxy"
chmod +x "$INSTALL_DIR/kimix-proxy"

echo "Done. Run 'max --help', 'glm --help', 'klaude --help', or 'kimix --help' to get started."
echo ""
echo "Set your API keys:"
echo "  export MINIMAX_API_KEY=your_key          # for max"
echo "  export ZAI_CODING_PLAN_API_KEY=your_key  # for glm"
echo "  export KIMI_CODING_API_KEY=your_key      # for klaude"
echo "  export KIMIX_API_KEY=your_key            # for kimix (or save to ~/.kimix/token)"
echo ""
echo "NOTE: kimix also requires Python 3 venv setup — see README for details."
