#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR="$ROOT/vendor/awesome-design-md"
REPO_URL="https://github.com/VoltAgent/awesome-design-md.git"

cd "$ROOT"

if [ -d "$VENDOR/.git" ]; then
  echo "Pulling latest awesome-design-md..."
  git -C "$VENDOR" pull --ff-only origin main
else
  echo "Cloning awesome-design-md (shallow)..."
  mkdir -p "$(dirname "$VENDOR")"
  git clone --depth 1 "$REPO_URL" "$VENDOR"
fi

node "$ROOT/scripts/build-design-index.mjs"

echo "Design repository updated."
