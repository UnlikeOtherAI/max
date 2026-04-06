#!/usr/bin/env bash
set -e

DEST="${MAX_INSTALL_DIR:-$HOME/bin}/max"

echo "Installing Max to $DEST ..."

curl -fsSL "https://raw.githubusercontent.com/UnlikeOtherAI/max/main/max" -o "$DEST"
chmod +x "$DEST"

echo "Done. Run 'max --help' to get started."
