#!/bin/zsh
set -euo pipefail

WORKSPACE="/Users/jaeschliman/.openclaw/workspace"
DESKTOP_MIRROR="$HOME/Desktop/Jarvis-System-Files"

mkdir -p "$DESKTOP_MIRROR"
mkdir -p "$DESKTOP_MIRROR/memory"

cp "$WORKSPACE/TASKS.md" "$DESKTOP_MIRROR/TASKS.md"
cp "$WORKSPACE/CURRENT.md" "$DESKTOP_MIRROR/CURRENT.md"
cp "$WORKSPACE/HEARTBEAT.md" "$DESKTOP_MIRROR/HEARTBEAT.md"
cp "$WORKSPACE/CONTINUITY.md" "$DESKTOP_MIRROR/CONTINUITY.md"
cp "$WORKSPACE/MEMORY.md" "$DESKTOP_MIRROR/MEMORY.md"

if [ -d "$WORKSPACE/memory" ]; then
  find "$WORKSPACE/memory" -maxdepth 1 -type f -name '20*.md' -print0 | while IFS= read -r -d '' file; do
    cp "$file" "$DESKTOP_MIRROR/memory/$(basename "$file")"
  done
fi

echo "Jarvis system files synced to: $DESKTOP_MIRROR"
