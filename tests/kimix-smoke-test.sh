#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

run_kimix() {
  KIMIX_CODEX_HOME="$TEMP_DIR/codex" \
  KIMIX_CODEX_BIN="$ROOT/tests/helpers/assert-kimi-api-key.sh" \
  KIMIX_STDIN=1 \
    "$ROOT/kimix" exec "confirm generated configuration"
}

assert_config() {
  local expected="$1"
  rg -q -F -- "$expected" "$TEMP_DIR/codex/config.toml" || {
    echo "missing config line: $expected" >&2
    exit 1
  }
}

assert_codex_parses_config() {
  KIMI_API_KEY=validation-only \
  KIMIX_CODEX_HOME="$TEMP_DIR/codex-parse" \
  KIMIX_CODEX_BIN="$(command -v codex)" \
  KIMIX_STDIN=1 \
    "$ROOT/kimix" --version > "$TEMP_DIR/codex-version"
  rg -q -F 'codex-cli ' "$TEMP_DIR/codex-version"
}

KIMI_API_KEY=test-key run_kimix
assert_config 'model = "kimi-k3"'
assert_config 'model_context_window = 1048576'
assert_config 'model_auto_compact_token_limit = 943718'
assert_config 'base_url = "https://api.moonshot.ai/v1"'
assert_config 'env_key = "KIMI_API_KEY"'
assert_config 'wire_api = "responses"'
assert_codex_parses_config

rm -rf "$TEMP_DIR/codex"
KIMIX_API_KEY=legacy-test-key run_kimix
assert_config 'env_key = "KIMI_API_KEY"'

echo "kimix direct Responses API smoke test passed"
