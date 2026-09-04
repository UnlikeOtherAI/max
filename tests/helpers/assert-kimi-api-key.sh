#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${KIMI_API_KEY:-}" ]]; then
  echo "kimix did not provide KIMI_API_KEY to Codex" >&2
  exit 1
fi
